import { Account, AccountBalance, Transaction } from "@entities";
import {
  Arg,
  Mutation,
  Query,
  Resolver,
  InputType,
  Field,
  Int,
  ObjectType,
  Info,
} from "type-graphql";
import {
  CalculateBalance,
  DateAmountAccountTuple,
  MatchTransfers,
} from "../utils/AccountUtils";

@InputType()
class AccountCreateInput {
  @Field()
  accountName: string;

  @Field()
  accountNumber: string;

  @Field()
  institution: string;

  @Field({ nullable: true })
  currency?: string;
}

@ObjectType()
class AccountWithState extends Account {
  @Field(() => Transaction, { nullable: true })
  latestTransaction: Transaction | null;

  @Field(() => AccountBalance, { nullable: true })
  latestBalance: AccountBalance | null;
}

@ObjectType()
class TransferPair {
  @Field(() => Transaction)
  from: Transaction;

  @Field(() => Transaction)
  to: Transaction;
}

@InputType()
class KnownBalance {
  @Field(() => Date)
  date: Date;

  @Field(() => Number)
  amountCents: Number;
}

@Resolver()
export class AccountResolver {
  @Mutation(() => Account)
  async createAccount(
    @Arg("options", () => AccountCreateInput) options: AccountCreateInput
  ) {
    const maybeAccount = await (
      await Account.find({ accountNumber: options.accountNumber })
    ).pop();
    if (maybeAccount) {
      return maybeAccount;
    }

    const newAccount = await Account.create(options).save();
    return newAccount;
  }

  @Query(() => [AccountWithState])
  async allAccounts(@Info() requestInfo: any) {
    var accounts = await Account.find();
    const selectedFields: Array<string> = requestInfo.fieldNodes[0].selectionSet.selections.map(
      (selection: any) => selection.name.value
    );

    if (
      !selectedFields.includes("latestTransaction") &&
      !selectedFields.includes("latestBalance")
    ) {
      return accounts;
    }

    return await Promise.all(
      accounts.map(async (account) => {
        const transactions = await account.transactions;
        const balances = await account.balances;
        return {
          ...account,
          latestTransaction: transactions
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .pop(),
          latestBalance: balances
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .pop(),
        } as AccountWithState;
      })
    );
  }

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

    const inserts = balances.map(
      async (bal) =>
        await AccountBalance.create({
          account: account,
          balanceCents: bal.amountCents,
          date: bal.date,
        }).save()
    );

    await Promise.all(inserts);
    return (await Account.findByIds([id])).pop();
  }

  @Mutation(() => [TransferPair])
  async generateTransfers(
    @Arg("accountIds", () => [Int]) accountIds: Array<number>
  ) {
    const accounts = await Account.findByIds(accountIds);

    const transactionsByAccount = await Promise.all(
      accounts.map(async (accnt) => {
        const transactions = await accnt.transactions;
        return transactions.map((t) => {
          return {
            date: new Date(t.date),
            amountCents: t.amountCents,
            transactionId: t.id,
            accountId: accnt.id,
          } as DateAmountAccountTuple;
        });
      })
    );

    let allTransactions: DateAmountAccountTuple[] = [];
    transactionsByAccount.forEach(
      (trans) => (allTransactions = allTransactions.concat(trans))
    );

    const pairs = MatchTransfers(allTransactions);

    const allPairIds: number[] = [];
    pairs.forEach((p) => {
      allPairIds.push(p.from);
      allPairIds.push(p.to);
    });

    const matchedTransactions = await Transaction.findByIds(allPairIds);

    const p = pairs.map((pair) => {
      return {
        from: matchedTransactions.find((t) => t.id === pair.from),
        to: matchedTransactions.find((t) => t.id === pair.to),
      } as TransferPair;
    });

    await Promise.all(
      p.map(async (pair) => {
        pair.to.transferPair = pair.from;
        pair.from.transferPair = pair.to;
        await Promise.all([pair.to.save(), pair.from.save()]);
      })
    );
    return p;
  }

  @Query(() => [AccountBalance])
  async getBalancesForAccount(@Arg("id", () => Int) id: number) {
    const account = (await Account.findByIds([id])).pop();
    if (!account) {
      throw new Error(`Account for id '${id}' could not be found.`);
    }

    return await account.balances;
  }

  @Mutation(() => [AccountBalance])
  async computeBalancesForAccount(@Arg("id", () => Int) id: number) {
    const account = (await Account.findByIds([id])).pop();
    if (!account) {
      throw new Error(`Account for id '${id}' could not be found.`);
    }

    return await account.balances;
  }
}
