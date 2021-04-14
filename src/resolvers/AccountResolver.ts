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
} from "type-graphql";

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
  @Field(() => Transaction)
  latestTransaction: Transaction;

  @Field(() => AccountBalance)
  latestBalance: AccountBalance;
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
  async allAccounts() {
    var accounts = await Account.find();

    return await Promise.all(
      accounts.map(async (account) => {
        const transactions = await account.transactions;
        const balances = await account.balances;
        return {
          ...account,
          latestTransaction: transactions
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .pop(),
          latestBalance: balances
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .pop(),
        } as AccountWithState;
      })
    );
  }

  @Query(() => [AccountBalance])
  async getBalancesForAccount(@Arg("id", () => Int) id: number) {
    const account = (await Account.findByIds([id])).pop();
    if (!account) {
      throw new Error(`Accoun for id '${id}' could not be found.`);
    }

    return await account.balances;
  }

  @Mutation(() => [AccountBalance])
  async computeBalancesForAccount(@Arg("id", () => Int) id: number) {
    const account = (await Account.findByIds([id])).pop();
    if (!account) {
      throw new Error(`Accoun for id '${id}' could not be found.`);
    }

    return await account.balances;
  }
}
