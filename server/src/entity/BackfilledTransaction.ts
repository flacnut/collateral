import { CoreTransaction } from './CoreTransaction';
import { Field, ObjectType } from 'type-graphql';
import { ChildEntity, Column } from 'typeorm';

@ChildEntity()
@ObjectType()
export class BackfilledTransaction extends CoreTransaction {
  @Field()
  @Column('text')
  backfillDate: string;
}
