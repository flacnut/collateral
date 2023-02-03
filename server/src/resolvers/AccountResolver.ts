import { Resolver } from "type-graphql";

@Resolver()
export class AccountResolver {
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
  

  @Mutation(() => [AccountBalance])
  async computeBalancesForAccount(@Arg("id", () => Int) id: number) {
    const account = (await Account.findByIds([id])).pop();
    if (!account) {
      throw new Error(`Account for id '${id}' could not be found.`);
    }

    return await account.balances;
  } */
}
