import { Transaction, Tag } from "@entities";
import { getManager, In } from "typeorm";
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
  async updateTransaction(
    @Arg("id", () => Int) id: number,
    @Arg("options", () => TransactionUpdateInput)
    options: TransactionUpdateInput
  ) {
    await Transaction.update({ id }, options);
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

    return await Transaction.findByIds(
      transactionish.map((t) => t.transactionId)
    );
  }
}
