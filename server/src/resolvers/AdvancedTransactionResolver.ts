import {
  Arg,
  Field,
  InputType,
  Int,
  ObjectType,
  Query,
  registerEnumType,
  Resolver,
} from 'type-graphql';
import { TransactionClassification } from 'src/entity/CoreTransaction';
import { Account, Tag } from '@entities';

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
  @Field(() => FilterType)
  type: FilterType;

  @Field(() => [TransactionClassification])
  tags: TransactionClassification[];
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
class QueryAggregationOptions {
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

  @Field(() => QueryAggregationOptions)
  aggregation: QueryAggregationOptions;
}

@ObjectType()
class AggregatedTransaction {
  @Field(() => Account, { nullable: true })
  account?: Account | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  month?: string | null;

  @Field(() => String, { nullable: true })
  classification?: string | null;

  @Field(() => [Tag], { nullable: true })
  tags?: Tag[] | null;

  @Field(() => Int)
  totalDepositCents: number;

  @Field(() => Int)
  totalExpenseCents: number;

  @Field(() => Int)
  transactionCount: number;

  @Field(() => [String])
  transactionIds: String[];
}

@Resolver()
export class AdvancedTransactionResolver {
  @Query(() => [AggregatedTransaction])
  async advancedTransactionQuery(
    @Arg('options', () => AdvancedTransactionQueryOptions)
    options: AdvancedTransactionQueryOptions,
  ): Promise<AggregatedTransaction[]> {
    return [];
  }
}
