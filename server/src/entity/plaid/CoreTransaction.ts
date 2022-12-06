import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryColumn,
  TableInheritance,
} from "typeorm";

@ObjectType()
@Entity("transaction")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class CoreTransaction extends BaseEntity {
  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  @Field()
  @Column("text")
  accountId: string;

  @Field()
  @Column("text")
  description: string;

  @Field(() => Int)
  @Column("int")
  amountCents: number;

  @Field()
  @Column("text")
  date: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  currency: string | null;

  // Additional Fields

  @Field(() => Number)
  amount() {
    return this.amountCents / 100;
  }

  // TODO: Balance in dollars
  // TODO: Invert account transactions (and balance)
  //       Cache results for perf.
}
