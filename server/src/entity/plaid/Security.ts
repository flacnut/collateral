import { Field, Int, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity("security")
@ObjectType()
export class Security extends BaseEntity {
  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  @Field()
  @Column("text")
  ticker: string;

  @Field()
  @Column("text")
  name: string;

  @Field(() => Int)
  @Column("int")
  closePriceCents: number;

  @Field()
  @Column("text")
  closePriceDate: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  currency: string | null;

  @Field()
  @Column("text")
  isin: string;

  @Field()
  @Column("text")
  cusip: string;

  @Field()
  @Column("text")
  sedol: string;

  @Field()
  @Column()
  isCashEquivalent: boolean;

  @Field()
  @Column("text")
  type: string;
}
