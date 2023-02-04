import { Field, Float, Int, ObjectType } from 'type-graphql';
import { CoreTransaction } from './CoreTransaction';
import { Column, ChildEntity } from 'typeorm';

@ChildEntity()
@ObjectType()
export class InvestmentTransaction extends CoreTransaction {
  @Field()
  @Column('text')
  securityId: string;

  @Field(() => Int)
  @Column('int')
  feesCents: number;

  @Field(() => Int)
  @Column('int')
  unitPriceCents: number;

  @Field(() => Float)
  @Column('float')
  quantity: number;

  @Field()
  @Column('text')
  type: string;

  @Field()
  @Column('text')
  subType: string;
}
