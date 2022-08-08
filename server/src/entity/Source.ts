import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from "typeorm";
import { Transaction } from "./Transaction";

@Entity()
@ObjectType()
export class Source extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: "date", nullable: false })
  importDate: Date;

  @Field()
  @Column("text")
  fileName: String;

  @Field(() => [Transaction], { nullable: true })
  @OneToMany(() => Transaction, (transaction) => transaction.source)
  transactions: Transaction[];
}
