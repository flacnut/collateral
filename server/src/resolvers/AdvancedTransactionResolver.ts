import {
  Arg,
  Field,
  InputType,
  Query,
  registerEnumType,
  Resolver,
} from 'type-graphql';
import {
  CoreTransaction,
  TransactionClassification,
} from 'src/entity/CoreTransaction';
import { AggregatedTransaction } from './TransactionResolver';
import { FindConditions, In, Not } from 'typeorm';

export enum FilterType {
  Any = 'any',
  All = 'all',
}

registerEnumType(FilterType, {
  name: 'FilterType',
  description: 'any or all',
});

@InputType()
class TagsFilter {
  @Field(() => FilterType)
  type: FilterType;

  @Field(() => [String])
  tags: string[];
}

@InputType()
class ClassificationsFilter {
  // Implicitly "any" type.
  @Field(() => [TransactionClassification])
  classifications: TransactionClassification[];
}

@InputType()
class AccountsFilter {
  // Implicitly "any" type.
  @Field(() => [String])
  accountIds: string[];
}

@InputType()
class Filters {
  @Field(() => AccountsFilter, { nullable: true })
  accounts: AccountsFilter | null;

  @Field(() => ClassificationsFilter, { nullable: true })
  classifications: ClassificationsFilter | null;

  @Field(() => TagsFilter, { nullable: true })
  tags: TagsFilter | null;
}

@InputType()
class AggregationOptions {
  @Field(() => Boolean, { nullable: true })
  account: boolean;

  @Field(() => Boolean, { nullable: true })
  description: boolean;

  @Field(() => Boolean, { nullable: true })
  month: boolean;

  @Field(() => Boolean, { nullable: true })
  classification: boolean;

  @Field(() => Boolean, { nullable: true })
  tags: boolean;
}

@InputType()
class AdvancedTransactionQueryOptions {
  @Field(() => Filters)
  includeFilters: Filters;

  @Field(() => Filters)
  excludeFilters: Filters;

  @Field(() => AggregationOptions)
  aggregation: AggregationOptions;
}

@Resolver()
export class AdvancedTransactionResolver {
  @Query(() => [AggregatedTransaction])
  async advancedTransactionQuery(
    @Arg('options', () => AdvancedTransactionQueryOptions)
    options: AdvancedTransactionQueryOptions,
  ): Promise<AggregatedTransaction[]> {
    // handle invalid input
    const hasAccountsFilter =
      options.includeFilters.accounts &&
      options.includeFilters.accounts.accountIds.length > 0;
    const hasExcludeAccountsFilter =
      options.excludeFilters.accounts &&
      options.excludeFilters.accounts.accountIds.length > 0;

    const hasTagsFilter =
      options.includeFilters.tags &&
      options.includeFilters.tags?.tags.length > 0;
    const hasExcludeTagsFilter =
      options.excludeFilters.tags &&
      options.excludeFilters.tags?.tags.length > 0;

    const hasClassificationsFilter =
      options.includeFilters.classifications &&
      options.includeFilters.classifications.classifications.length > 0;
    const hasExcludeClassificationsFilter =
      options.excludeFilters.classifications &&
      options.excludeFilters.classifications.classifications.length > 0;
    if (
      !hasAccountsFilter &&
      !hasClassificationsFilter &&
      !hasTagsFilter &&
      !hasExcludeAccountsFilter &&
      !hasExcludeClassificationsFilter &&
      !hasExcludeTagsFilter
    ) {
      return [];
    }

    // fetch with filters for classifications & accounts
    let ormOptions = {
      where: {} as FindConditions<CoreTransaction>,
    };

    // if BOTH exclude and include filters are provided here, we
    // should just use the include filters. Set the excludes and just
    // overwrite them if there's includes.
    if (hasExcludeAccountsFilter) {
      ormOptions.where.accountId = Not(
        In(options.excludeFilters.accounts?.accountIds ?? []),
      );
    }

    if (hasExcludeClassificationsFilter) {
      ormOptions.where.classification = Not(
        In(options.excludeFilters.classifications?.classifications ?? []),
      );
    }

    if (hasAccountsFilter) {
      ormOptions.where.accountId = In(
        options.includeFilters.accounts?.accountIds ?? [],
      );
    }

    if (hasClassificationsFilter) {
      ormOptions.where.classification = In(
        options.includeFilters.classifications?.classifications ?? [],
      );
    }

    const transactions = await CoreTransaction.find(ormOptions);

    // filter out based on tags
    // Notes: This could be made faster with a more complex manual SQL query
    // on transaction_tags_tag table and injecting the result as a transactionId IN (...)
    // but it will be harder to maintain. For now, this is good enough.
    const filteredTransactions = (
      await Promise.all(
        transactions.map(async (t): Promise<CoreTransaction | null> => {
          let transactionTags = (await t.tags).map((t) => t.name);
          // only include transaction if there's no tags filter
          let hasIncludeTags = !hasTagsFilter;
          let hasExcludeTags = false;

          if (hasTagsFilter) {
            hasIncludeTags = !!(options.includeFilters.tags?.type ===
            FilterType.All
              ? options.includeFilters.tags.tags.every((desiredTag) =>
                  transactionTags.includes(desiredTag),
                )
              : options.includeFilters.tags?.tags
                  .map((desiredTag) => transactionTags.includes(desiredTag))
                  .includes(true));
          }

          if (hasExcludeTagsFilter) {
            hasExcludeTags = !!(options.excludeFilters.tags?.type ===
            FilterType.All
              ? options.excludeFilters.tags.tags.every((desiredTag) =>
                  transactionTags.includes(desiredTag),
                )
              : options.excludeFilters.tags?.tags
                  .map((desiredTag) => transactionTags.includes(desiredTag))
                  .includes(true));
          }

          return hasIncludeTags && !hasExcludeTags ? t : null;
        }),
      )
    ).filter((t) => t) as unknown as CoreTransaction[];

    // aggregate
    const getMonthNormalizeDate = (d: Date | string): Date => {
      let date = new Date(d);
      date.setDate(1);
      return date;
    };

    const getGroupKey = async (t: CoreTransaction): Promise<string> => {
      let key = '';
      if (options.aggregation.account) key += '::' + t.accountId;
      if (options.aggregation.classification)
        key += '::' + (t.classification ?? '').toString();
      if (options.aggregation.description) key += '::' + t.description;
      if (options.aggregation.month)
        key += '::' + getMonthNormalizeDate(t.date).toLocaleDateString();
      if (options.aggregation.tags)
        key +=
          '::' +
          (await t.tags)
            .map((tag) => tag.name)
            .sort()
            .join(':');

      return key;
    };

    let groups: { [key: string]: AggregatedTransaction } = {};
    await Promise.all(
      filteredTransactions.map(async (t) => {
        let key = await getGroupKey(t);
        await t.applyAmountUpdates();

        if (!groups[key]) {
          groups[key] = {
            totalDepositCents: 0,
            totalExpenseCents: 0,
            transactionCount: 0,
            transactionIds: [],
          };

          if (options.aggregation.account)
            groups[key].account = await t.account();
          if (options.aggregation.classification)
            groups[key].classification = (t.classification ?? '').toString();
          if (options.aggregation.description)
            groups[key].description = t.description;
          if (options.aggregation.month)
            groups[key].month = getMonthNormalizeDate(
              t.date,
            ).toLocaleDateString();
          if (options.aggregation.tags) groups[key].tags = await t.tags;
        }

        groups[key].transactionCount++;
        groups[key].transactionIds.push(t.id);
        t.amountCents < 0
          ? (groups[key].totalDepositCents += Math.abs(t.amountCents))
          : (groups[key].totalExpenseCents += Math.abs(t.amountCents));
      }),
    );
    return Object.values(groups).sort(
      (a, b) => b.transactionCount - a.transactionCount,
    );
  }
}
