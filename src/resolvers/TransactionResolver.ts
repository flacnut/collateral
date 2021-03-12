import { Transaction } from "../entity/Transaction";
import {
  Arg,
  Field,
  Int,
  Mutation,
  InputType,
  Query,
  Resolver,
} from "type-graphql";

@InputType()
class TransactionUpdateInput {
  @Field(() => Date)
  date?: Date;

  @Field()
  originalDescription?: string;

  @Field()
  friendlyDescription?: string;

  @Field(() => Int)
  amountCents?: number;
}

@Resolver()
export class TransactionResolver {
  @Mutation(() => Boolean)
  async updateTransaction(
    @Arg("id", () => Int) id: number,
    @Arg("options", () => TransactionUpdateInput)
    options: TransactionUpdateInput
  ) {
    await Transaction.update({ id }, options);
    return true;
  }

  @Query(() => [Transaction])
  async transactions() {
    var Transactions = await Transaction.find();
    console.dir(Transactions);
    return Transactions;
  }
}
