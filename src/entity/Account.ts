import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from "typeorm";
import { AccountBalance } from "./AccountBalance";

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

  @Field(() => [AccountBalance], { nullable: true })
  @OneToMany(() => AccountBalance, (balance) => balance.account)
  balances: AccountBalance[];
}
