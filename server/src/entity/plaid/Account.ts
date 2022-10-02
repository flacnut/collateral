import { Field, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity("plaid_account")
@ObjectType()
export class PlaidAccount extends BaseEntity {

  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  @Field()
  @Column("text")
  itemId: string;

  @Field()
  @Column("text")
  institutionId: string;

  @Field()
  @Column("text")
  name: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  officialName: string | null;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  mask: string | null;

  @Field()
  @Column("text")
  type: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  subtype: string | null;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  currency: string | null;
}
