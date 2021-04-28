import { Account, Tag } from "@entities";
import { Field, ObjectType, Int } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from "typeorm";

@Entity()
@ObjectType()
export class TagRule extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("text", { nullable: false })
  name: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  descriptionContains: string | null;

  @Field(() => Int, { nullable: true })
  @Column("int", { nullable: true })
  minimumAmount: number | null;

  @Field(() => Int, { nullable: true })
  @Column("int", { nullable: true })
  maximumAmount: number | null;

  @Field(() => [Account], { nullable: true })
  @JoinTable()
  @ManyToMany(() => Account)
  forAccounts: Promise<Account[]>;

  @Field(() => [Tag])
  @JoinTable()
  @ManyToMany(() => Tag)
  tagsToAdd: Promise<Tag[]>;

  @Field(() => Tag)
  @OneToOne(() => Tag)
  @JoinColumn()
  thisTag: Tag;
}
