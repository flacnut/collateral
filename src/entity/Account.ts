import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from "typeorm";
import { AccountBalance } from "./AccountBalance";
import { Transaction } from "./Transaction";
import { Holding } from "./Holding";

@Entity()
@ObjectType()
export class Account extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: false })
  @Column("text", { nullable: false })
  institution: string;

  @Field({ nullable: false })
  @Column("text", { nullable: false })
  accountNumber: String;

  @Field({ nullable: false })
  @Column("text", { nullable: false })
  accountName: String;

  @Field({ nullable: false })
  @Column("text", { nullable: false, default: "USD" })
  currency: String;

  @Field(() => [AccountBalance], { nullable: true })
  @OneToMany(() => AccountBalance, (balance) => balance.account, { lazy: true })
  balances: Promise<AccountBalance[]>;

  @Field(() => [AccountBalance], { nullable: true })
  @OneToMany(() => AccountBalance, (balance) => balance.account, { lazy: true })
  holdings: Promise<Holding[]>;

  @Field(() => [Transaction], { nullable: true })
  @OneToMany(() => Transaction, (transaction) => transaction.source, {
    lazy: true,
  })
  transactions: Promise<Transaction[]>;
}
