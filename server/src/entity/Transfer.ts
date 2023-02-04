import { Field, InputType, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { CoreTransaction } from "@entities";

@ObjectType()
@Entity()
export class Transfer extends BaseEntity {
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  @Field(() => CoreTransaction)
  @OneToOne(() => CoreTransaction)
  @JoinColumn()
  to: CoreTransaction;

  @Field(() => CoreTransaction)
  @OneToOne(() => CoreTransaction)
  @JoinColumn()
  from: CoreTransaction;

  @Field(() => String)
  @Column()
  date: string;

  @Field(() => Int)
  @Column()
  amountCents: number;
}

@InputType()
export class UnsavedTransfer {
  @Field(() => String, { nullable: false })
  toId: string;

  @Field(() => String, { nullable: false })
  fromId: string;
}
