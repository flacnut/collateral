import { Account, AccountBalance, Transaction, Transfer } from "@entities";
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
import { In, IsNull, Not } from "typeorm";
import {
  CalculateBalance,
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
    const selectedFields: Array<string> =
      requestInfo.fieldNodes[0].selectionSet.selections.map(
        (selection: any) => selection.name.value
      );

    if (
      !selectedFields.includes("latestTransaction") &&
      !selectedFields.includes("latestBalance")
    ) {
      return accounts;
    }

    const data = await Promise.all(
      accounts.map(async (account) => {
        const transactions = await account.transactions;
        const balances = await account.balances;
        return {
          ...account,
          knownBalanceDate: new Date(account.knownBalanceDate),
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
    console.dir(data);
    return data;
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
    account.knownBalanceAmountCents = knownBalance.amountCents;
    account.knownBalanceDate = knownBalance.date;
    await account.save();

    let toInsert = balances.map(bal => {
      return {
        accountId: account.id,
        balanceCents: bal.amountCents,
        date: bal.date,
      };
    });

    while (toInsert.length) {
      let thisInsert = toInsert.slice(0, 50);
      toInsert = toInsert.slice(50);
      await AccountBalance.createQueryBuilder().insert().values(thisInsert).execute();
    }
    return (await Account.findOne(id));
  }

  @Query(() => [Transfer])
  async getTransfers(
    @Arg("accountIds", () => [Int]) accountIds: Array<number>
  ) {
    const transferTransactions = await Transaction.find({
      transferPairId: Not(IsNull()),
      accountId: In(accountIds),
    });

    const pairs = transferTransactions.reduce(
      (memo: { [key: number]: number }, transaction) => {
        if (transaction.amountCents < 0) {
          memo[transaction.id] = transaction.transferPairId;
        }
        return memo;
      },
      {}
    );

    return Object.keys(pairs)
      .map((fromId) => {
        return {
          to: transferTransactions.find((t) => t.id === pairs[Number(fromId)]),
          from: transferTransactions.find((t) => t.id === Number(fromId)),
        };
      })
      .filter((transfer) => transfer.to != null && transfer.from != null);
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
