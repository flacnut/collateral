import {
  Arg,
  Field,
  Int,
  InputType,
  Query,
  Resolver,
  registerEnumType,
} from 'type-graphql';
import {
  Between,
  MoreThan,
  LessThan,
  Raw,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { FindOperator } from 'typeorm';

enum ListOptions {
  ALL_OF = 'ALL_OF',
  ANY_OF = 'ANY_OF',
  NONE_OF = 'NONE_OF',
  EMPTY = 'EMPTY',
  NOT_EMPTY = 'NOT_EMPTY',
}

registerEnumType(ListOptions, {
  name: 'ListOptions',
  description: 'How one set filters of another set.',
});

enum GroupByOptions {
  DESCRIPTION = 'originalDescription',
  FRIENDLY_DESCRIPTION = 'friendlyDescription',
  TAGS = 'tags',
  ACCOUNT = 'account',
}

registerEnumType(GroupByOptions, {
  name: 'GroupByOptions',
  description: 'Basic group-by options for transactions.',
});

enum TextMatchOptions {
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  CONTAINS = 'CONTAINS',
  EQUALS = 'EQUALS',
}

registerEnumType(TextMatchOptions, {
  name: 'TextMatchOptions',
  description: 'How strings are compared.',
});

enum NumberCompareOptions {
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OET = 'GREATER_THAN_OET',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_OET = 'LESS_THAN_OET',
  BETWEEN = 'BETWEEN',
  EQUALS = 'EQUALS',
}

registerEnumType(NumberCompareOptions, {
  name: 'NumberCompareOptions',
  description: 'How number values are compared.',
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
class DateFilter {
  @Field(() => Date)
  value: Date;

  @Field(() => Date)
  secondValue: Date;

  @Field(() => NumberCompareOptions)
  compare: NumberCompareOptions;
}

@InputType()
class TextFilter {
  @Field(() => [String])
  text: String[];

  @Field(() => TextMatchOptions)
  match: TextMatchOptions;
}

@InputType()
class ListFilter {
  @Field(() => [Int])
  itemIds: number[];

  @Field(() => ListOptions)
  queryBy: ListOptions;
}

@InputType()
class RichQueryFilter {
  @Field(() => AmountFilter, { nullable: true })
  amount: AmountFilter;

  @Field(() => TextFilter, { nullable: true })
  description: TextFilter;

  @Field(() => DateFilter, { nullable: true })
  date: DateFilter;

  @Field(() => ListFilter, { nullable: true })
  tags: ListFilter;

  @Field(() => ListFilter, { nullable: true })
  accounts: ListFilter;

  @Field(() => Boolean)
  excludeTransfers: Boolean;
}

@InputType()
class RichQuery {
  @Field(() => RichQueryFilter)
  where: RichQueryFilter;
}

function getAmountFilter(
  amountFilter: AmountFilter,
): FindOperator<number> | number {
  switch (amountFilter.compare) {
    case NumberCompareOptions.GREATER_THAN:
      return MoreThan(amountFilter.amountCents);
    case NumberCompareOptions.GREATER_THAN_OET:
      return MoreThanOrEqual(amountFilter.amountCents);
    case NumberCompareOptions.LESS_THAN:
      return LessThan(amountFilter.amountCents);
    case NumberCompareOptions.LESS_THAN_OET:
      return LessThanOrEqual(amountFilter.amountCents);
    case NumberCompareOptions.BETWEEN:
      return Between(
        Math.min(amountFilter.amountCents, amountFilter.secondAmountCents),
        Math.max(amountFilter.amountCents, amountFilter.secondAmountCents),
      );
    default:
    case NumberCompareOptions.EQUALS:
      return amountFilter.amountCents;
  }
}

function getDateFilter(dateFilter: DateFilter): FindOperator<string> | string {
  const firstDate = new Date(dateFilter.value);
  const secondDate = new Date(dateFilter.secondValue);

  const firstDateStr = `${firstDate.getFullYear()}-${
    firstDate.getMonth() + 1
  }-${firstDate.getDate()}}`;

  const secondDateStr = `${secondDate.getFullYear()}-${
    secondDate.getMonth() + 1
  }-${secondDate.getDate()}}`;

  switch (dateFilter.compare) {
    case NumberCompareOptions.GREATER_THAN:
      return MoreThan(firstDateStr);
    case NumberCompareOptions.GREATER_THAN_OET:
      return MoreThanOrEqual(firstDateStr);
    case NumberCompareOptions.LESS_THAN:
      return LessThan(firstDateStr);
    case NumberCompareOptions.LESS_THAN_OET:
      return LessThanOrEqual(firstDateStr);
    case NumberCompareOptions.BETWEEN:
      return Between(firstDateStr, secondDateStr);
    default:
    case NumberCompareOptions.EQUALS:
      return firstDateStr;
  }
}

function getTextFilter(textFilter: TextFilter): FindOperator<string> | string {
  const allMatches = textFilter.text
    .map((t) => t.toUpperCase())
    .map((upperText) => {
      switch (textFilter.match) {
        case TextMatchOptions.CONTAINS:
          return `(UPPER(originalDescription) LIKE '%${upperText}%' OR UPPER(friendlyDescription) LIKE '%${upperText}%')`;

        case TextMatchOptions.STARTS_WITH:
          return `(UPPER(originalDescription) LIKE '${upperText}%' OR UPPER(friendlyDescription) LIKE '${upperText}%')`;

        case TextMatchOptions.ENDS_WITH:
          return `(UPPER(originalDescription) LIKE '%${upperText}' OR UPPER(friendlyDescription) LIKE '%${upperText}')`;
        default:
        case TextMatchOptions.EQUALS:
          return `(UPPER(originalDescription) = '${upperText}' OR UPPER(friendlyDescription) = '${upperText}')`;
      }
    });

  return Raw((_) => `(` + allMatches.join(' OR ') + `)`);
}

/*
function includeTransactionForFilters(
  tagsFilter: ListFilter,
  transactionItemsMap: { id: number; items: number[] } | null
): boolean {
  if (!transactionItemsMap) {
    return false;
  }

  switch (tagsFilter.queryBy) {
    case ListOptions.ALL_OF:
      return tagsFilter.itemIds.every(
        (neededTagId) => transactionItemsMap.items.indexOf(neededTagId) > -1
      );
    case ListOptions.ANY_OF:
      return tagsFilter.itemIds.some((neededTagId) => {
        return transactionItemsMap.items.indexOf(neededTagId) > -1;
      });
    case ListOptions.NONE_OF:
      return tagsFilter.itemIds.every(
        (neededTagId) => transactionItemsMap.items.indexOf(neededTagId) === -1
      );
    case ListOptions.EMPTY:
      return transactionItemsMap.items.length === 0;
    case ListOptions.NOT_EMPTY:
      return transactionItemsMap.items.length > 0;
  }
}*/

@Resolver()
export class FilteredTransactionResolver {
  @Query(() => [Int])
  async getFilteredTransactions(
    @Arg('options', () => RichQuery) options: RichQuery,
  ) {
    // We could hand-roll our own SQLite for a perf boost, but
    // using the API means we can swap the underlying instance
    // to Postgres or MySQL easily. This is not performant, but
    // is very flexible in future.

    if (Object.keys(options.where).length === 1) {
      return [];
    }

    if (options.where.amount) {
      getAmountFilter(options.where.amount);
    }

    if (options.where.description) {
      getTextFilter(options.where.description);
    }

    if (options.where.date) {
      getDateFilter(options.where.date);
    }

    /*let transactions = await Transaction.find({
      where: searchOptions,
    });

    if (options.where.accounts) {
      transactions = transactions.filter((t) =>
        includeTransactionForFilters(options.where.accounts, {
          id: t.id,
          items: [t.accountId],
        })
      );
    }
    /*
    if (options.where.tags) {
      const transactionTagMap = (
        await Promise.all(
          transactions.map(async (t) => {
            return { id: t.id, tags: await t.tags };
          })
        )
      ).map((ttm) => {
        return { id: ttm.id, items: ttm.tags.map((tag) => tag.id) };
      });

      transactions = transactions.filter((t) =>
        includeTransactionForFilters(
          options.where.tags,
          transactionTagMap.find((ttm) => ttm.id === t.id) ?? null
        )
      );
    }
    */

    return [];
  }
}
