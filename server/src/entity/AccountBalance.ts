import { Entity, BaseEntity, Column, PrimaryColumn } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';

@Entity('account_balance')
@ObjectType()
export class AccountBalance extends BaseEntity {
  @Field()
  @PrimaryColumn('text')
  lastUpdateDate: string;

  @Field()
  @PrimaryColumn('text')
  accountId: string;

  @Field(() => Int)
  @Column('int')
  availableCents: number;

  @Field(() => Int)
  @Column('int')
  balanceCents: number;

  @Field(() => Int)
  @Column('int')
  limitCents: number;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  currency: string | null;
}
