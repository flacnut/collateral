import { Account, CoreTransaction, PlaidItem } from '@entities';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class AccountResolver {
  @Query(() => [Account])
  async getAccounts(
    @Arg('accountIds', () => [String], { nullable: true }) accountIds: string[],
  ) {
    if (accountIds && accountIds.length > 0) {
      return await Account.findByIds(accountIds);
    }

    return await Account.find();
  }

  @Mutation(() => Boolean)
  async deleteAccount(@Arg('accountId', () => String) accountId: string) {
    const account = await Account.findOne({ id: accountId });
    if (account) {
      const accountsForItem = await Account.find({
        itemId: account.itemId,
      });

      await CoreTransaction.delete({ accountId: accountId });
      await Account.delete({ id: accountId });

      if (accountsForItem.length === 1) {
        await PlaidItem.delete({ id: account.itemId });
      }
    }

    return true;
  }

  /*
  @Mutation(() => Account)
  async generateBalancesForAccount(
    @Arg("id", () => Int) id: number,
    @Arg("knownBalance", () => KnownBalance) knownBalance: KnownBalance
  ) {
    const account = (await Account.findByIds([id])).pop();
    if (!account) {
      throw new Error(`Account for id '${id}' could not be found.`);
    }

    const transactions = await account.transactions;

    const balances = CalculateBalance(
      transactions.map((t) => {
        return { date: new Date(t.date), amountCents: t.amountCents };
      }),
      {
        date: new Date(knownBalance.date),
        amountCents: Number(knownBalance.amountCents),
      }
    );

    await AccountBalance.delete({ account: account });
    account.knownBalanceAmountCents = knownBalance.amountCents;
    account.knownBalanceDate = knownBalance.date;
    await account.save();

    let toInsert = balances.map((bal) => {
      return {
        accountId: account.id,
        balanceCents: bal.amountCents,
        date: bal.date,
      };
    });

    while (toInsert.length) {
      let thisInsert = toInsert.slice(0, 50);
      toInsert = toInsert.slice(50);
      await AccountBalance.createQueryBuilder()
        .insert()
        .values(thisInsert)
        .execute();
    }
    return await Account.findOne(id);
  }
  */
}
