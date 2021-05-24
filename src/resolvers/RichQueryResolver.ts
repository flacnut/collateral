import { Transaction, Transfer } from "@entities";
import { Between, MoreThan, LessThan, Not, In } from "typeorm";
import {
  Arg,
  Field,
  Int,
  InputType,
  Query,
  Resolver,
  registerEnumType,
} from "type-graphql";
import { FindOperator } from "typeorm";
import { TransactionGroup } from "./TransactionResolver";

enum SetOptions {
  ALL_OF = "ALL_OF",
  ANY_OF = "ANY_OF",
  NONE_OF = "NONE_OF",
  EMPTY = "EMPTY",
  NOT_EMPTY = "NOT_EMPTY",
}

registerEnumType(SetOptions, {
  name: "SetOptions",
  description: "How one set filters of another set.",
});

enum GroupByOptions {
  DESCRIPTION = "originalDescription",
  FRIENDLY_DESCRIPTION = "friendlyDescription",
  TAGS = "tags",
  ACCOUNT = "account",
}

registerEnumType(GroupByOptions, {
  name: "GroupByOptions",
  description: "Basic group-by options for transactions.",
});

enum TextMatchOptions {
  STARTS_WITH = "STARTS_WITH",
  ENDS_WITH = "ENDS_WITH",
  CONTAINS = "CONTAINS",
  EQUALS = "EQUALS",
}

registerEnumType(TextMatchOptions, {
  name: "TextMatchOptions",
  description: "How strings are compared.",
});

enum NumberCompareOptions {
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  BETWEEN = "BETWEEN",
  EQUALS = "EQUALS",
}

registerEnumType(NumberCompareOptions, {
  name: "NumberCompareOptions",
  description: "How number values are compared.",
});

/*
@InputType()
class TextFilter {
  @Field(() => String)
  text: String;

  @Field(() => TextMatchOptions)
  match: TextMatchOptions;
}*/

@InputType()
class AmountFilter {
  @Field(() => Int)
  amountCents: number;

  @Field(() => Int, { nullable: true })
  secondAmountCents: number;

  @Field(() => NumberCompareOptions)
  compare: NumberCompareOptions;
}
/*
@InputType()
class DateFilter {
  @Field(() => Date)
  value: Date;

  @Field(() => Date)
  secondValue: Date;

  @Field(() => NumberCompareOptions)
  compare: NumberCompareOptions;
}

@InputType()
class SetFilter {
  @Field(() => [Int])
  itemIds: number[];

  @Field(() => SetOptions)
  queryBy: SetOptions;
}*/

@InputType()
class RichQueryFilter {
  /*
  @Field(() => SetFilter, { nullable: true })
  tags: SetFilter;

  @Field(() => TextFilter, { nullable: true })
  description: TextFilter;
  */

  @Field(() => AmountFilter, { nullable: true })
  amount: AmountFilter;

  /*
  @Field(() => DateFilter, { nullable: true })
  date: DateFilter;

  @Field(() => SetFilter, { nullable: true })
  account: SetFilter; */
}

@InputType()
class RichQuery {
  @Field(() => RichQueryFilter)
  where: RichQueryFilter;

  /*
  @Field(() => GroupByOptions)
  groupBy: GroupByOptions;*/
}

function getAmountFilter(
  amountFilter: AmountFilter
): FindOperator<Number> | Number {
  switch (amountFilter.compare) {
    case NumberCompareOptions.GREATER_THAN:
      return MoreThan(amountFilter.amountCents);
    case NumberCompareOptions.LESS_THAN:
      return LessThan(amountFilter.amountCents);
    case NumberCompareOptions.BETWEEN:
      return Between(
        Math.min(amountFilter.amountCents, amountFilter.secondAmountCents),
        Math.max(amountFilter.amountCents, amountFilter.secondAmountCents)
      );
    default:
    case NumberCompareOptions.EQUALS:
      return amountFilter.amountCents;
  }
}

@Resolver()
export class RichQueryResolver {
  @Query(() => [Transaction])
  async getFilteredTransactions(
    @Arg("options", () => RichQuery) options: RichQuery
  ) {
    console.dir(getAmountFilter(options.where.amount));

    const transfers = await Transfer.find();

    return await Transaction.find({
      where: [
        {
          amountCents: getAmountFilter(options.where.amount),
          id: Not(In(transfers.map((t) => [t.to.id, t.from.id]).flat())),
        },
      ],
    });
  }

  @Query(() => [TransactionGroup])
  async richTransactionQuery(
    @Arg("options", () => RichQuery) options: RichQuery
  ) {
    return options ? [] : [];
  }
  /*
    let rawResults;
    if (options.where && options.where.tags) {
      // tricky
    }*/

  /*

    if (options.groupBy) {
      let builder = Transaction.createQueryBuilder("tran")
        .select(options.groupBy.toString(), options.groupBy.toString())
        .addSelect("COUNT(*)", "transactionCount")
        .addSelect("SUM(tran.amountCents)", "amountCentsSum")
        .addSelect("group_concat(id)", "_transactionIds");

      if (options.where) {
        builder = builder.where("1 = 1");

        if (options.where.description) {
          const { text, match } = options.where.description;
          builder = builder.andWhere(
            "(tran.originalDescription LIKE :needle OR tran.friendlyDescription LIKE :needle)",
            {
              needle: `${
                match === TextMatchOptions.ENDS_WITH ||
                match === TextMatchOptions.CONTAINS
                  ? "%"
                  : ""
              }${text}${
                match === TextMatchOptions.STARTS_WITH ||
                match === TextMatchOptions.CONTAINS
                  ? "%"
                  : ""
              }`,
            }
          );
        }
      }
      
      let builder = Transaction.createQueryBuilder("tran");
      if (options.where.amount) {
        const { value, secondValue, compare } = options.where.amount;
        let statement = "";
        switch (compare) {
          case NumberCompareOptions.GREATER_THAN:
            statement = "tran.amountCents > :value1";
            break;
          case NumberCompareOptions.LESS_THAN:
            statement = "tran.amountCents < :value1";
            break;
          case NumberCompareOptions.BETWEEN:
            statement =
              "(tran.amountCents > :value1 AND tran.amountCents < :value2)";
            break;
          default:
          case NumberCompareOptions.EQUALS:
            statement = "tran.amountCents = :value1";
            break;
        }

        builder = builder.andWhere(statement, {
          value1: Math.min(value, secondValue),
          value2: Math.max(value, secondValue),
        });
      }

      rawResults = await builder
        //.groupBy(options.groupBy.toString())
        .getRawMany();
    }

    return rawResults
      ? rawResults.map((transactionGroup) => {
          return {
            ...transactionGroup,
            transactionIds: transactionGroup._transactionIds.split(","),
          };
        })
      : [];
  } */

  /*
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
  } */
}
