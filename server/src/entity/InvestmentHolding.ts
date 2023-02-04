import { Entity, BaseEntity, Column, PrimaryColumn } from 'typeorm';
import { Field, Float, Int, ObjectType } from 'type-graphql';

@Entity('investment_holding')
@ObjectType()
export class InvestmentHolding extends BaseEntity {
  @Field()
  @PrimaryColumn('text', { nullable: false, unique: true })
  accountId: string;

  @Field()
  @PrimaryColumn('text', { nullable: false, unique: true })
  securityId: string;

  @Field(() => Int)
  @Column('int')
  costBasisCents: number;

  @Field(() => Float)
  @Column('float')
  quantity: number;

  @Field(() => Int)
  @Column('int')
  institutionPriceCents: number;

  @Field(() => Int)
  @Column('int')
  institutionValueCents: number;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  institutionPriceAsOfDate: string | null;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  currency: string | null;
}
