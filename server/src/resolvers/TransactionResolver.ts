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
  BackfilledTransaction,
  CoreTransaction,
  InvestmentTransaction,
  Tag,
  Transaction,
  Transfer,
} from '@entities';
import {
  BaseTransaction,
  DateAmountAccountTuple,
  MatchTransfers,
} from '../../src/utils/AccountUtils';
import { FindConditions, FindManyOptions, In, IsNull, Not } from 'typeorm';
import { TransactionClassification } from 'src/entity/CoreTransaction';
import { UnsavedTransfer } from '../../src/entity/Transfer';

@InputType()
class QueryTransactionsByPropertyOptions {
  @Field(() => String, { nullable: true })
  accountId: string;

  @Field(() => String, { nullable: true })
  description: string;
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

  @Field(() => Boolean, { nullable: true })
  unclassifiedOnly: boolean;
}

@ObjectType()
export class AggregatedTransaction {
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

@ObjectType()
class GroupedTransactions {
  @Field(() => [CoreTransaction])
  transactions: BaseTransaction[];

  @Field(() => String)
  key: string;
}

const AnyTransaction = createUnionType({
  name: 'AnyTransaction',
  types: () =>
    [Transaction, InvestmentTransaction, BackfilledTransaction] as const,
});

@Resolver()
export class TransactionResolver {
  @Query(() => AnyTransaction, { nullable: true })
  async getTransaction(@Arg('id') id: string) {
    return (await CoreTransaction.findOne(id)) ?? null;
  }

  @Query(() => [AnyTransaction], { nullable: false })
  async getTransactionsById(@Arg('ids', () => [String]) ids: string[]) {
    return await CoreTransaction.findByIds(ids);
  }

  @Query(() => [AnyTransaction], { nullable: false })
  async getTransactionsByProperty(
    @Arg('properties', () => QueryTransactionsByPropertyOptions)
    properties: QueryTransactionsByPropertyOptions,
  ) {
    return await CoreTransaction.find({ where: properties });
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
      if (options.classification)
        key += '::' + (t.classification ?? '').toString();
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

    let queryOptions = { where: {} };
    if (options.unclassifiedOnly) {
      queryOptions.where = {
        classification: IsNull(),
      };
    }

    let allTransactions = await CoreTransaction.find(queryOptions);
    let groups: { [key: string]: AggregatedTransaction } = {};

    if (!!options.unclassifiedOnly) {
      allTransactions = allTransactions.filter(
        async (t) => (await t.tags).length === 0,
      );
    }

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
            groups[key].classification = (t.classification ?? '').toString();
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

  @Query(() => [GroupedTransactions])
  async getTransactionsByTags(
    @Arg('classifications', () => [TransactionClassification], {
      nullable: true,
    })
    classifications: TransactionClassification[],
    @Arg('tags', () => [String]) tags: string[],
  ) {
    // get Tag Ids
    const allTags = await Tag.find();
    const tagIds = allTags
      .filter((t) => tags.indexOf(t.name) != -1)
      .map((t) => t.id);

    const transactionsForTagsResult = (await Tag.getRepository().query(`
      SELECT 
        transactionId
      FROM 
        transaction_tags_tag
      WHERE
        tagId IN (${tagIds.join(',')})
      GROUP BY transactionId`)) as [{ transactionId: string }];

    // get Transactions
    let filters: FindConditions<CoreTransaction> = {
      id: In(transactionsForTagsResult.map((t) => t.transactionId)),
    };

    if (classifications.length > 0) {
      filters.classification = In(classifications);
    }

    const transactions = await CoreTransaction.find({
      where: filters,
    });

    const syncTagTransactions = await Promise.all(
      transactions.map(async (t) => {
        return {
          ...t,
          syncTags: await t.tags,
        } as CoreTransaction & { syncTags: Tag[] };
      }),
    );

    // Reduce and return
    const reducer = (
      memo: { [key: string]: (CoreTransaction & { syncTags: Tag[] })[] },
      x: CoreTransaction & { syncTags: Tag[] },
    ) => {
      const key = `${x.syncTags
        .map((t) => t.name)
        .sort()
        .join('::')}__${classifications.length > 0 ? x.classification : 'any'}`;

      if (!memo[key]) {
        memo[key] = [];
      }

      memo[key].push(x);

      return memo;
    };

    const results = syncTagTransactions.reduce(reducer, {});
    return Object.keys(results)
      .map((key) => {
        return {
          key,
          transactions: results[key].map((t) => {
            return { ...t, tags: t.syncTags };
          }),
        };
      })
      .sort((a, b) => b.transactions.length - a.transactions.length);
  }

  @Query(() => [GroupedTransactions])
  async getDuplicates(
    @Arg('accountId', () => String, { nullable: true }) accountId: string,
  ) {
    const reducer = (
      memo: { [key: string]: CoreTransaction[] },
      x: CoreTransaction,
    ) => {
      const key = `${Math.abs(x.amountCents)}__${x.date}__${x.description
        .toLocaleLowerCase()
        .trim()}__${x.accountId}`;

      if (!memo[key]) {
        memo[key] = [];
      }

      memo[key].push(x);

      return memo;
    };

    const findOptions = {} as FindManyOptions<CoreTransaction>;
    if (!!accountId) {
      findOptions.where = { accountId };
    }

    const transactions = await CoreTransaction.find(findOptions);
    const results = transactions.reduce(reducer, {});

    return Object.keys(results)
      .map((key) => {
        return {
          key,
          transactions: results[key],
        };
      })
      .filter((gt) => gt.transactions.length > 1)
      .sort((a, b) => b.transactions.length - a.transactions.length);
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
    const changes = (await CoreTransaction.findByIds(transactionIds)).map(
      (t) => {
        return {
          id: t.id,
          column: 'description',
          oldValue: t.description,
          newValue: description,
        };
      },
    );

    await CoreTransaction.getRepository()
      .createQueryBuilder()
      .update(CoreTransaction)
      .set({ description })
      .whereInIds(transactionIds)
      .execute();

    await Promise.all(
      changes.map(async (change) =>
        this.recordUpdateEvent(
          change.id,
          change.column,
          change.oldValue,
          change.newValue,
        ),
      ),
    );

    return await CoreTransaction.findByIds(transactionIds);
  }

  @Mutation(() => [Transaction])
  async updateTransactionClassification(
    @Arg('transactionIds', () => [String]) transactionIds: string[],
    @Arg('classification', () => TransactionClassification)
    classification: TransactionClassification,
  ) {
    const changes = (await CoreTransaction.findByIds(transactionIds)).map(
      (t) => {
        return {
          id: t.id,
          column: 'classification',
          oldValue: t.classification,
          newValue: classification,
        };
      },
    );

    await CoreTransaction.getRepository()
      .createQueryBuilder()
      .update(CoreTransaction)
      .set({ classification: classification })
      .whereInIds(transactionIds)
      .execute();

    await Promise.all(
      changes.map(async (change) =>
        this.recordUpdateEvent(
          change.id,
          change.column,
          change.oldValue,
          change.newValue,
        ),
      ),
    );

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

  @Mutation(() => [AnyTransaction])
  async invertTransactionAmount(
    @Arg('transactionIds', () => [String]) transactionIds: string[],
  ) {
    const transactions = await CoreTransaction.findByIds(transactionIds);
    const updates = transactions.map(async (t) => {
      const oldAmount = t.amountCents;
      t.amountCents = oldAmount * -1;
      await t.save();
      await this.recordUpdateEvent(
        t.id,
        'amountCents',
        oldAmount.toString(),
        t.amountCents.toString(),
      );
    });

    await Promise.all(updates);
    return await CoreTransaction.findByIds(transactionIds);
  }

  @Mutation(() => Boolean)
  async deleteTransactions(
    @Arg('transactionIds', () => [String]) transactionIds: string[],
  ) {
    const transactions = await CoreTransaction.findByIds(transactionIds);
    const softRemoves = transactions.map(async (t) => {
      await t.softRemove();
    });

    await Promise.all(softRemoves);
    return true;
  }

  // TODO: this doesn't belong here
  async getOrCreateTag(name: string) {
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return existingTag;
    }

    return await Tag.create({ name }).save();
  }

  async recordUpdateEvent(
    transactionId: string,
    column: string,
    oldValue: string,
    newValue: string,
  ) {
    const date = new Date().toLocaleDateString();
    const transaction = await CoreTransaction.findOne(transactionId);
    if (!transaction) {
      // TODO: handle
      console.error('Not Transaction');
      return;
    }

    transaction.appendChangeLog({
      date,
      column,
      oldValue,
      newValue,
    });

    return await transaction.save();
  }

  @Mutation(() => Boolean)
  async deletePending() {
    const transactionIds = await Transaction.find({ pending: true });
    return this.deleteTransactions(transactionIds.map((t) => t.id));
  }
}
