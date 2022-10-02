import { Field, Float, Int, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity("plaid_investment_holding")
@ObjectType()
export class PlaidInvestmentHolding extends BaseEntity {
  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  accountId: string;

  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  securityId: string;

  @Field()
  @Column("text")
  name: string;

  @Field(() => Int)
  @Column("int")
  costBasisCents: number;

  @Field(() => Float)
  @Column("float")
  quantity: number;

  @Field()
  @Column("text")
  institutionPrice: string;

  @Field(() => Int)
  @Column("int")
  institutionValueCents: number;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  institutionPriceAsOfDate: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  currency: string | null;
}
