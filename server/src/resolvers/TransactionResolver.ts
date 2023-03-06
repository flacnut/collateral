import {
  Arg,
  Field,
  Int,
  InputType,
  Query,
  Resolver,
  ObjectType,
  createUnionType,
  Mutation,
} from 'type-graphql';

import {
  Account,
  CoreTransaction,
  InvestmentTransaction,
  Tag,
  Transaction,
  Transfer,
} from '@entities';
import {
  DateAmountAccountTuple,
  MatchTransfers,
} from '../../src/utils/AccountUtils';
import { TransactionClassification } from 'src/entity/CoreTransaction';
import { UnsavedTransfer } from '../../src/entity/Transfer';
import { FindManyOptions, In, IsNull, Not } from 'typeorm';

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

const AnyTransaction = createUnionType({
  name: 'AnyTransaction',
  types: () => [Transaction, InvestmentTransaction] as const,
});

@Resolver()
export class TransactionResolver {
  @Query(() => AnyTransaction, { nullable: true })
  async getTransaction(@Arg('id') id: string) {
    return (await CoreTransaction.findOne(id)) ?? null;
  }

  @Query(() => [AnyTransaction])
  async getTransactions(
    @Arg('accountId', { nullable: true }) accountId: string,
    @Arg('limit', () => Int, { nullable: true, defaultValue: 100 })
    limit: number,
    @Arg('after', () => Int, { nullable: true, defaultValue: 0 }) after: number,
  ) {
    const options = {
      where: {},
      order: { date: 'DESC' },
      skip: after,
      take: limit,
    } as FindManyOptions<CoreTransaction>;

    if (accountId != null) {
      options.where = { accountId };
    }

    return await CoreTransaction.find(options);
  }

  @Query(() => [InvestmentTransaction])
  async getInvestmentTransactions(
    @Arg('accountId', { nullable: true }) accountId: string,
    @Arg('limit', { nullable: true, defaultValue: 100 }) limit: number,
    @Arg('after', { nullable: true, defaultValue: 0 }) after: number,
  ) {
    const options = {
      where: {},
      order: { date: 'DESC' },
      skip: after,
      take: limit,
    } as FindManyOptions<CoreTransaction>;

    if (accountId != null) {
      options.where = { accountId };
    }

    return await InvestmentTransaction.find(options);
  }

  @Query(() => [AggregatedTransaction])
  async getAggregatedTransactions(
    @Arg('options', () => QueryAggregationOptions)
    options: QueryAggregationOptions,
  ) {
    if (
      !options.account &&
      !options.month &&
      !options.description &&
      !options.classification &&
      !options.tags
    ) {
      throw new Error('Please provide valid aggregation options');
    }

    const getMonthNormalizeDate = (d: Date | string): Date => {
      let date = new Date(d);
      date.setDate(1);
      return date;
    };

    const getGroupKey = async (t: CoreTransaction): Promise<string> => {
      let key = '';
      if (options.account) key += '::' + t.accountId;
      if (options.classification) key += '::' + t.classification.toString();
      if (options.description) key += '::' + t.description;
      if (options.month)
        key += '::' + getMonthNormalizeDate(t.date).toLocaleDateString();
      if (options.tags)
        key +=
          '::' +
          (await t.tags)
            .map((tag) => tag.name)
            .sort()
            .join(':');

      return key;
    };

    const allTransactions = await CoreTransaction.find();
    let groups: { [key: string]: AggregatedTransaction } = {};

    await Promise.all(
      allTransactions.map(async (t) => {
        let key = await getGroupKey(t);
        await t.applyAmountUpdates();

        if (!groups[key]) {
          groups[key] = {
            totalDepositCents: 0,
            totalExpenseCents: 0,
            transactionCount: 0,
            transactionIds: [],
          };

          if (options.account) groups[key].account = await t.account();
          if (options.classification)
            groups[key].classification = t.classification.toString();
          if (options.description) groups[key].description = t.description;
          if (options.month)
            groups[key].month = getMonthNormalizeDate(
              t.date,
            ).toLocaleDateString();
          if (options.tags) groups[key].tags = await t.tags;
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

  // *********
  // TRANSFERS
  // *********

  @Query(() => [Transfer])
  async getTransfers() {
    const transfers = await Transfer.find({
      relations: ['to', 'from'],
      order: {
        date: 'DESC',
      },
      take: 50,
    });

    return transfers;
  }

  @Query(() => [Transfer])
  async getPossibleTransfers() {
    const transactions = await CoreTransaction.find({
      where: [
        {
          classification: Not(TransactionClassification.Transfer),
        },
        {
          classification: IsNull(),
        },
      ],
    });

    const rawTransfers = MatchTransfers(
      transactions.map((t) => {
        return {
          date: t.date,
          amountCents: t.amountCents,
          accountId: t.accountId,
          transactionId: t.id,
        } as DateAmountAccountTuple;
      }),
    );

    let transfers = rawTransfers.map((transfer) => {
      let to = transactions.filter((t) => t.id === transfer.to)[0];
      let from = transactions.filter((t) => t.id === transfer.from)[0];

      return {
        from,
        to,
        date: from.date,
        amountCents: transfer.amountCents,
      } as Transfer;
    });

    return transfers;
  }

  @Mutation(() => [Transfer])
  async saveTransfers(
    @Arg('transfers', () => [UnsavedTransfer]) transfers: UnsavedTransfer[],
  ) {
    let transactionIds = transfers
      .map((transfer) => {
        return [transfer.toId, transfer.fromId];
      })
      .flat();
    let transactions = await CoreTransaction.findByIds(transactionIds);

    if (transactions.length !== 2 * transfers.length) {
      console.error('Should be unreachable.');
    }

    let transferWrites = transfers
      .map((_transfer) => {
        let from = transactions.find((t) => t.id === _transfer.fromId);
        let to = transactions.find((t) => t.id === _transfer.toId);
        if (from == null || to == null) {
          return null;
        }

        let transfer = new Transfer();
        transfer.id = _transfer.fromId;
        transfer.from = from;
        transfer.to = to;
        transfer.amountCents = to.amountCents;
        transfer.date = from.date;
        return transfer;
      })
      .filter((t) => t != null) as Transfer[];

    transactions.forEach(
      (t) => (t.classification = TransactionClassification.Transfer),
    );

    await CoreTransaction.getRepository().save(transactions);
    await Transfer.getRepository().save(transferWrites);

    return transferWrites;
  }

  // *************
  // EDIT / UPDATE
  // *************

  @Mutation(() => [AnyTransaction])
  async updateTransactionDescription(
    @Arg('transactionIds', () => [String]) transactionIds: string[],
    @Arg('description', () => String)
    description: string,
  ) {
    await CoreTransaction.getRepository()
      .createQueryBuilder()
      .update(CoreTransaction)
      .set({ description })
      .whereInIds(transactionIds)
      .execute();

    return await CoreTransaction.findByIds(transactionIds);
  }

  @Mutation(() => [Transaction])
  async updateTransactionClassification(
    @Arg('transactionIds', () => [String]) transactionIds: string[],
    @Arg('classification', () => TransactionClassification)
    classification: TransactionClassification,
  ) {
    await CoreTransaction.getRepository()
      .createQueryBuilder()
      .update(CoreTransaction)
      .set({ classification: classification })
      .whereInIds(transactionIds)
      .execute();

    return await CoreTransaction.findByIds(transactionIds);
  }

  @Mutation(() => [Transaction])
  async updateTransactionTags(
    @Arg('transactionIds', () => [String]) transactionIds: string[],
    @Arg('addTags', () => [String]) addTags: string[],
    @Arg('removeTags', () => [String]) removeTags: string[],
    @Arg('force', () => Boolean) force: boolean,
  ) {
    try {
      // ensure the tags exist (handle new tags)
      const resolvedAddTags = await Promise.all(
        addTags.map(this.getOrCreateTag),
      );
      const resolvedRemoveTags = await Tag.find({
        name: In(removeTags),
      });

      // Edit these transaction tags per each transaction.
      const transactions = await CoreTransaction.findByIds(transactionIds);

      const removeIds = resolvedRemoveTags.map((t) => t.id);
      const shouldRemoveId = (id: number) => removeIds.indexOf(id) > -1;

      // add/remove tags
      // Force: Ignore removeTags, because we'll set all transactions to ONLY have
      // addTags. This wipes out all existing tags, and ensures all these transactions
      // have exactly the same tag values.
      const updates = transactions.map(async (transaction) => {
        let tags = (await transaction.tags) ?? [];
        let newTags = force
          ? resolvedAddTags
          : tags
              .filter((tag) => !shouldRemoveId(tag.id))
              .concat(resolvedAddTags);

        transaction.tags = Promise.resolve(newTags);
        return await transaction.save();
      });

      await Promise.all(updates);
      return await CoreTransaction.findByIds(transactionIds);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // TODO: this doesn't belong here
  async getOrCreateTag(name: string) {
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return existingTag;
    }

    return await Tag.create({ name }).save();
  }
}
