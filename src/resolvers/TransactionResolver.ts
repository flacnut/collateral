import { Transaction, Tag } from "@entities";
import {
  Arg,
  Field,
  Int,
  Mutation,
  InputType,
  Query,
  Resolver,
} from "type-graphql";
import { getManager, In } from "typeorm";

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
    var transactions = await Transaction.find();
    return transactions;
  }

  @Query(() => [Transaction])
  async transactionsByTags(@Arg("tags", () => [String]) tagNames: string[]) {
    const tags = await Tag.find({ tag: In(tagNames) });
    const tagIds = tags.map((t) => t.id).join(",");

    if (!tagNames.every((tagName) => tags.find((tag) => tag.tag === tagName))) {
      throw new Error("Invalid tags supplied");
    }

    const transactionish: Array<{
      transactionId: number;
      tagIds: string;
    }> = await getManager().query(`
        SELECT transactionId, tagIds 
        FROM (
          SELECT transactionId, group_concat(tagId) tagIds 
          FROM transaction_tags_tag 
          WHERE tagId IN (${tagIds}) 
          GROUP BY transactionId
        ) 
        WHERE tagIds = "${tagIds}"`);

    return Transaction.findByIds(transactionish.map((t) => t.transactionId));
  }
}
