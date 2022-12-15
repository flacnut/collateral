import { Field, ObjectType } from "type-graphql";
import { ChildEntity, Column } from "typeorm";
import { CoreTransaction } from "./CoreTransaction";

@ChildEntity()
@ObjectType()
export class PlaidTransaction extends CoreTransaction {
  @Field()
  @Column("text")
  category: string;

  @Field()
  @Column("text")
  categoryId: string;

  @Field()
  @Column("text")
  dateTime: string;

  @Field()
  @Column("text")
  authorizedDate: string;

  @Field()
  @Column("text")
  authorizedDateTime: string;

  @Field()
  @Column("text")
  locationJson: string;

  @Field()
  @Column("text")
  paymentMetaJson: string;

  @Field()
  @Column("text")
  originalDescription: string;

  @Field()
  @Column("text")
  merchant: string;

  @Field()
  @Column("text")
  paymentChannel: string;

  @Field()
  @Column("text")
  transactionCode: string;
}
