import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Column,
} from "typeorm";
import { Field, ObjectType, Int } from "type-graphql";
import { Account, Transaction } from "@entities";

@Entity()
@ObjectType()
export class Transfer extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Transaction)
  @OneToOne(() => Transaction, (transaction) => transaction.transferPair, {
    eager: true,
  })
  @JoinColumn()
  from: Transaction;

  @Field(() => Transaction)
  @OneToOne(() => Transaction, (transaction) => transaction.transferPair, {
    eager: true,
  })
  @JoinColumn()
  to: Transaction;

  // These fields not exposed over GraphQL, not needed.

  // This is the date the transaction began, not the date it cleared
  // It is taken from the "from" transaction post date.
  @Column("date")
  date: Date;

  @ManyToOne(() => Account, (account) => account.outgoingTransfers, {
    eager: true,
  })
  @JoinColumn()
  fromAccount: Account;

  @ManyToOne(() => Account, (account) => account.incomingTransfers, {
    eager: true,
  })
  @JoinColumn()
  toAccount: Account;
}
