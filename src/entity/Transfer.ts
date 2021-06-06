import { Field, ObjectType } from "type-graphql";
import { Transaction } from "@entities";

@ObjectType()
export class Transfer {
  @Field(() => Transaction)
  from: Transaction;

  @Field(() => Transaction)
  to: Transaction;
}
