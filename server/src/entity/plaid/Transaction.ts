import { Field, Int, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity("plaid_transaction")
@ObjectType()
export class PlaidTransaction extends BaseEntity {

  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  @Field()
  @Column("text")
  accountId: string;

  @Field(() => Int)
  @Column("int")
  amountCents: number;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  currency: string | null;

  // array
  @Field()
  @Column("text")
  category: string;

  @Field()
  @Column("text")
  categoryId: string;

  @Field()
  @Column("text")
  date: string;

  @Field()
  @Column("text")
  dateTime: string;

  @Field()
  @Column("text")
  authorizedDate: string;

  @Field()
  @Column("text")
  authorizedDateTime: string;

  @Field()
  @Column("text")
  locationJson: string;

  @Field()
  @Column("text")
  paymentMetaJson: string;

  @Field()
  @Column("text")
  description: string;

  @Field()
  @Column("text")
  originalDescription: string;

  @Field()
  @Column("text")
  merchant: string;

  @Field()
  @Column("text")
  paymentChannel: string;

  @Field()
  @Column("text")
  transactionCode: string;
}
