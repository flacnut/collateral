import { CoreTransaction } from './CoreTransaction';
import { Field, ObjectType } from 'type-graphql';
import { ChildEntity, Column } from 'typeorm';

@ChildEntity()
@ObjectType()
export class Transaction extends CoreTransaction {
  @Field()
  @Column('text', { default: '' })
  category: string;

  @Field()
  @Column('text', { default: '' })
  categoryId: string;

  @Field()
  @Column('text', { default: '' })
  dateTime: string;

  @Field()
  @Column('text', { default: '' })
  authorizedDate: string;

  @Field()
  @Column('text', { default: '' })
  authorizedDateTime: string;

  @Field()
  @Column('text', { default: '' })
  locationJson: string;

  @Field()
  @Column('text', { default: '' })
  paymentMetaJson: string;

  @Field()
  @Column('text', { default: '' })
  originalDescription: string;

  @Field()
  @Column('text', { default: '' })
  merchant: string;

  @Field()
  @Column('text', { default: '' })
  paymentChannel: string;

  @Field()
  @Column('text', { default: '' })
  transactionCode: string;

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  pending: boolean;
}
