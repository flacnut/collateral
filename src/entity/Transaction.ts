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
import { Field, ObjectType, Int } from "type-graphql";

@Entity()
@ObjectType()
export class Transaction extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Date)
  @Column("date")
  date: Date;

  @Field()
  @Column()
  originalDescription: string;

  @Field()
  @Column({ nullable: true })
  friendlyDescription: string;

  @Field(() => Int)
  @Column("int")
  amountCents: number;

  @Field(() => [Tag])
  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Promise<Tag[]>;

  @Field(() => Source)
  @ManyToOne(() => Source, (source) => source.transactions, { lazy: true })
  source: Promise<Source>;
}
