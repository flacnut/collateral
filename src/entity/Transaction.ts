import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
  OneToOne,
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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
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
  @JoinColumn({ name: "sourceId" })
  source: Promise<Source>;

  @Column()
  sourceId: number;

  @Field(() => Account)
  @ManyToOne(() => Account, (account) => account.transactions, { lazy: true })
  @JoinColumn({ name: "accountId" })
  account: Promise<Account>;

  @Column()
  accountId: number;

  @Field(() => Transaction, { nullable: true })
  @OneToOne(() => Transaction)
  @JoinColumn({ name: "transferPairId" })
  transferPair: Transaction | null;

  @Column({ nullable: true })
  transferPairId: number;
}
