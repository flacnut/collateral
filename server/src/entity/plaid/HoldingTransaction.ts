import { Field, Float, Int, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity("plaid_holding_transaction")
@ObjectType()
export class PlaidHoldingTransaction extends BaseEntity {

  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  @Field()
  @Column("text")
  accountId: string;

  @Field()
  @Column("text")
  securityId: string;

  @Field()
  @Column("text")
  description: string;

  @Field(() => Int)
  @Column("int")
  amountCents: number;

  @Field(() => Int)
  @Column("int")
  feesCents: number;

  @Field(() => Int)
  @Column("int")
  unitPriceCents: number;

  @Field(() => Float)
  @Column("float")
  quantity: number;

  @Field()
  @Column("text")
  date: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  currency: string | null;

  @Field()
  @Column("text")
  type: string;

  @Field()
  @Column("text")
  subType: string;
}
