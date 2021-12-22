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
export class AccountBalance extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { nullable: false })
  @Column({ type: "date", nullable: false })
  date: Date;

  @Field(() => Int, { nullable: false })
  @Column({ type: "int", nullable: false })
  balanceCents: Number;

  @Column()
  accountId: Number;

  @Field(() => Account, { nullable: false })
  @ManyToOne(() => Account, (account) => account.balances, { nullable: false })
  account: Account;
}
