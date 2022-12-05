import { Field, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn, ManyToOne, AfterLoad } from "typeorm";
import { PlaidAccountBalance } from "./Balance";
import { PlaidItem } from "./Item";

@Entity("plaid_account")
@ObjectType()
export class PlaidAccount extends BaseEntity {

  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  @Field()
  @Column("text")
  itemId: string;

  @Field()
  @Column("text")
  institutionId: string;

  @Field()
  @Column("text")
  name: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  officialName: string | null;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  mask: string | null;

  @Field()
  @Column("text")
  type: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  subtype: string | null;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  currency: string | null;

  @ManyToOne(() => PlaidItem, (item) => item.accounts)
  item: PlaidItem;

  @Field(() => PlaidAccountBalance)
  latestBalance: PlaidAccountBalance | null;

  @AfterLoad()
  async setLatestBalance() {
    const balances = await PlaidAccountBalance.find({
      accountId: this.id });
    this.latestBalance = balances
      .sort((a, b) => (new Date(a.lastUpdateDate)).getTime() - (new Date(b.lastUpdateDate)).getTime())
      .pop() ?? null;
  }
}
