import { CoreTransaction } from './CoreTransaction';
import { Field, ObjectType } from 'type-graphql';
import { ChildEntity, Column } from 'typeorm';

@ChildEntity()
@ObjectType()
export class Transaction extends CoreTransaction {
  @Field()
  @Column('text')
  category: string;

  @Field()
  @Column('text')
  categoryId: string;

  @Field()
  @Column('text')
  dateTime: string;

  @Field()
  @Column('text')
  authorizedDate: string;

  @Field()
  @Column('text')
  authorizedDateTime: string;

  @Field()
  @Column('text')
  locationJson: string;

  @Field()
  @Column('text')
  paymentMetaJson: string;

  @Field()
  @Column('text')
  originalDescription: string;

  @Field()
  @Column('text')
  merchant: string;

  @Field()
  @Column('text')
  paymentChannel: string;

  @Field()
  @Column('text')
  transactionCode: string;

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  pending: boolean;
}
