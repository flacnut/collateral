import { Field, Int, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity("plaid_account_balance")
@ObjectType()
export class PlaidAccountBalance extends BaseEntity {

  @Field()
  @PrimaryColumn("text")
  lastUpdateDate: string;

  @Field()
  @PrimaryColumn("text")
  accountId: string;

  @Field(() => Int)
  @Column("int")
  availableCents: number;

  @Field(() => Int)
  @Column("int")
  balanceCents: number;

  @Field(() => Int)
  @Column("int")
  limitCents: number;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  currency: string | null;
}
