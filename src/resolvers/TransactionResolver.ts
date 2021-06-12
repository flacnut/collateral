import { Account, Transaction, Tag, Source } from "@entities";
import { getManager, getConnection, In } from "typeorm";
import {
  Arg,
  Field,
  Int,
  Mutation,
  InputType,
  Query,
  Resolver,
  registerEnumType,
  ObjectType,
} from "type-graphql";
import {
  BaseTransaction,
  DetectDuplicateTransactions,
} from "../utils/AccountUtils";

enum GroupByOption {
  originalDescription = "originalDescription",
  friendlyDescription = "friendlyDescription",
  Tag = "Tag",
}

registerEnumType(GroupByOption, {
  name: "GroupByOption",
  description: "Basic group-by options for transactions", // this one is optional
});

@InputType()
class TransactionUpdateInput {
  @Field(() => Date)
  date?: Date;

  @Field()
  originalDescription?: string;

  @Field()
  friendlyDescription?: string;

  @Field(() => Int)
  amountCents?: number;
}

@InputType()
class TransactionUpdateTagsInput {
  @Field(() => Int)
  id: number;

  @Field(() => [Int])
  tags: number[];
}

@InputType()
class TransactionBulkCreateInput {
  @Field(() => Date)
  date: Date;

  @Field()
  originalDescription: string;

  @Field({ nullable: true })
  friendlyDescription?: string;

  @Field(() => Int)
  amountCents: number;
}

@InputType()
class TransactionCreateInput extends TransactionBulkCreateInput {
  @Field(() => Int)
  sourceId: number;

  @Field(() => Int)
  accountId: number;
}

@ObjectType()
export class TransactionGroup {
  @Field(() => String, { nullable: true })
  originalDescription: string | null;

  @Field(() => String, { nullable: true })
  friendlyDescription: string | null;

  @Field(() => String, { nullable: true })
  tag: string | null;

  @Field(() => Int)
  amountCentsSum: number;

  @Field(() => Int)
  transactionCount: number;

  @Field(() => [Int])
  transactionIds: Array<number>;
}

@Resolver()
export class TransactionResolver {
  @Mutation(() => Boolean)
  async createTransactions(
    @Arg("transactions", () => [TransactionBulkCreateInput])
    transactions: Array<TransactionCreateInput>,
    @Arg("sourceId", () => Number) sourceId: number,
    @Arg("accountId", () => Number) accountId: number
  ) {
    // Verify source & account exist so we don't break foreign keys
    const [source, account] = await Promise.all([
      (await Source.findByIds([sourceId]))?.pop(),
      (await Account.findByIds([accountId]))?.pop(),
    ]);

    if (!source || !account) {
      throw new Error(
        `createTransaction: Invalid ${source ? "accountId" : "sourceId"}`
      );
    }

    const existingTransactions = await Transaction.find({
      accountId,
    });

    const maybeInsertTransactions = transactions.map((transaction) => {
      return {
        id: undefined,
        ...transaction,
        sourceId: sourceId,
        accountId: accountId,
      };
    });

    const { unique, duplicates } = DetectDuplicateTransactions(
      existingTransactions,
      maybeInsertTransactions as BaseTransaction[]
    );

    console.dir(
      `${duplicates.length} duplicates of ${transactions.length} found. Will insert ${unique.length} new transactions.`
    );

    if (unique.length === 0) {
      return true;
    }

    await Transaction.createQueryBuilder().insert().values(unique).execute();

    return true;
  }

  @Mutation(() => Transaction)
  async createTransaction(
    @Arg("options", () => TransactionCreateInput)
    options: TransactionCreateInput
  ) {
    const [source, account] = await Promise.all([
      (await Source.findByIds([options.sourceId]))?.pop(),
      (await Account.findByIds([options.accountId]))?.pop(),
    ]);

    if (!source || !account) {
      throw new Error(
        `createTransaction: Invalid ${source ? "accountId" : "sourceId"}`
      );
    }

    const newTransaction = await Transaction.create(options).save();
    newTransaction.source = Promise.resolve(source);
    newTransaction.account = Promise.resolve(account);
    newTransaction.tags = Promise.resolve([]);
    newTransaction.save();
    return newTransaction;
  }

  @Mutation(() => Boolean)
  async updateTransaction(
    @Arg("id", () => Int) id: number,
    @Arg("options", () => TransactionUpdateInput)
    options: TransactionUpdateInput
  ) {
    await Transaction.update({ id }, options);
    return true;
  }

  @Mutation(() => Boolean)
  async updateTransactionTags(
    @Arg("options", () => [TransactionUpdateTagsInput])
    options: TransactionUpdateTagsInput[]
  ) {
    const connection = await getConnection();
    const transactionIds = options.map(
      (transactionUpdateTagsInput) => transactionUpdateTagsInput.id
    );

    const chunksArray: number[][] = [];
    transactionIds.forEach((tid, i) => {
      if (!chunksArray[Math.floor(i / 100)]) {
        chunksArray[Math.floor(i / 100)] = [];
      }
      chunksArray[Math.floor(i / 100)].push(tid);
    });

    const transactions = (
      await Promise.all(
        chunksArray.map(async (ids) => {
          return await Transaction.findByIds(ids);
        })
      )
    ).flat();

    const allUpdateActions = transactions.map(async (transaction) => {
      const allExpectedTags =
        options.find((o) => o.id === transaction.id)?.tags ?? [];
      const existingTags = (await transaction.tags).map((et) => et.id);

      const tagsToAdd = allExpectedTags.filter(
        (expectedId) => existingTags.indexOf(expectedId) < 0
      );

      const updateActions = tagsToAdd.map((tagToAdd) => {
        return connection
          .createQueryBuilder()
          .relation(Transaction, "tags")
          .of(transaction)
          .add(tagToAdd);
      });

      return Promise.all(updateActions);
    });

    await Promise.all(allUpdateActions);
    return true;
  }

  @Query(() => [Transaction])
  async transactions() {
    return await Transaction.find();
  }

  @Query(() => [TransactionGroup])
  async groupedTransactions(
    @Arg("groupBy", () => GroupByOption) groupBy: GroupByOption,
    @Arg("tag", () => String, { nullable: true }) tagName: String | null
  ) {
    let raw = [];
    if (
      groupBy === GroupByOption.friendlyDescription ||
      groupBy === GroupByOption.originalDescription
    ) {
      raw = await Transaction.createQueryBuilder("tran")
        .select(groupBy.toString(), groupBy.toString())
        .addSelect("COUNT(*)", "transactionCount")
        .addSelect("SUM(tran.amountCents)", "amountCentsSum")
        .addSelect("group_concat(id)", "_transactionIds")
        .groupBy(groupBy.toString())
        .getRawMany();
    }

    if (groupBy === GroupByOption.Tag) {
      if (!tagName) {
        throw new Error("tag required when grouping by tag");
      }

      raw = await Transaction.createQueryBuilder("tran")
        .innerJoinAndSelect("tran.tags", "tag")
        .select("tag.tag", "tag")
        .addSelect("COUNT(*)", "transactionCount")
        .addSelect("SUM(tran.amountCents)", "amountCentsSum")
        .addSelect("group_concat(tran.id)", "_transactionIds")
        .where("tag.tag = :tagName", { tagName })
        .groupBy("tag.tag")
        .getRawMany();
    }

    return raw.map((transactionGroup) => {
      return {
        ...transactionGroup,
        transactionIds: transactionGroup._transactionIds.split(","),
      };
    });
  }

  @Query(() => [Transaction])
  async transactionsByTags(@Arg("tags", () => [String]) tagNames: string[]) {
    const tags = await Tag.find({ tag: In(tagNames) });
    const tagIds = tags.map((t) => t.id).join(",");

    if (!tagNames.every((tagName) => tags.find((tag) => tag.tag === tagName))) {
      throw new Error("Invalid tags supplied");
    }

    const transactionish: Array<{
      transactionId: number;
      tagIds: string;
    }> = await getManager().query(`
        SELECT transactionId, tagIds 
        FROM (
          SELECT transactionId, group_concat(tagId) tagIds 
          FROM transaction_tags_tag 
          WHERE tagId IN (${tagIds}) 
          GROUP BY transactionId
        ) 
        WHERE tagIds = "${tagIds}"`);

    const chunksArray: number[][] = [];
    transactionish
      .map((t) => t.transactionId)
      .forEach((tid, i) => {
        if (!chunksArray[Math.floor(i / 100)]) {
          chunksArray[Math.floor(i / 100)] = [];
        }
        chunksArray[Math.floor(i / 100)].push(tid);
      });

    return (
      await Promise.all(
        chunksArray.map(async (ids) => {
          return await Transaction.findByIds(ids);
        })
      )
    ).flat();
  }
}
