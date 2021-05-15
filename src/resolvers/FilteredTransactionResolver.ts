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

@InputType()
class AmountFilter {
  @Field(() => Int)
  amountCents: number;

  @Field(() => Int, { nullable: true })
  secondAmountCents: number;

  @Field(() => NumberCompareOptions)
  compare: NumberCompareOptions;
}

@InputType()
class RichQueryFilter {
  @Field(() => AmountFilter, { nullable: true })
  amount: AmountFilter;
}

@InputType()
class RichQuery {
  @Field(() => RichQueryFilter)
  where: RichQueryFilter;
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
export class FilteredTransactionResolver {
  @Query(() => [Transaction])
  async getFilteredTransactions(
    @Arg("options", () => RichQuery) options: RichQuery
  ) {
    // We could hand-roll our own SQLite for a perf boost, but
    // using the API means we can swap the underlying instance
    // to Postgres or MySQL easily.
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
}
