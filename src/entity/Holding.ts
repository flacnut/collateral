import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { Account } from "./Account";

@Entity()
@ObjectType()
export class Holding extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { nullable: false })
  @Column({ type: "date", nullable: false })
  date: Date;

  @Field({ nullable: false })
  @Column({ type: "text", nullable: false })
  symbol: String;

  @Field(() => Int, { nullable: false })
  @Column({ type: "decimal", nullable: false })
  quantity: Number;

  @Field(() => Account, { nullable: false })
  @ManyToOne(() => Account, (account) => account.holdings, { nullable: false })
  account: Account;
}
