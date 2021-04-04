import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from "typeorm";
import { Tag } from "./Tag";
import { Source } from "./Source";
import { Account } from "./Account";
import { Field, ObjectType, Int } from "type-graphql";

@Entity()
@ObjectType()
export class Transaction extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column("date")
  date: Date;

  @Field()
  @Column()
  originalDescription: string;

  @Field(() => String)
  @Column()
  friendlyDescription: string;

  @Field(() => Int)
  @Column("int")
  amountCents: number;

  @Field(() => [Tag])
  @JoinTable()
  @ManyToMany(() => Tag, { onDelete: "NO ACTION" })
  tags: Promise<Tag[]>;

  @Field(() => Source)
  @ManyToOne(() => Source, (source) => source.transactions, { lazy: true })
  source: Promise<Source>;

  @Field(() => Account)
  @ManyToOne(() => Account, (account) => account.transactions, { lazy: true })
  account: Promise<Account>;
}
