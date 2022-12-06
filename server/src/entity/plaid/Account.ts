import { Arg, Field, Int, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { PlaidAccountBalance } from "./Balance";
import { CoreTransaction } from "./CoreTransaction";
import { PlaidInstitution } from "./Institution";
import { PlaidItem } from "./Item";

@Entity("plaid_account")
@ObjectType()
export class PlaidAccount extends BaseEntity {
  // Core Plaid Fields

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

  // Additional Fields

  @ManyToOne(() => PlaidItem, (item) => item.accounts)
  item: PlaidItem;

  @Field(() => PlaidAccountBalance)
  async latestBalance() {
    const balances = await PlaidAccountBalance.find({
      accountId: this.id,
    });
    return (
      balances
        .sort(
          (a, b) =>
            new Date(a.lastUpdateDate).getTime() -
            new Date(b.lastUpdateDate).getTime()
        )
        .pop() ?? null
    );
  }

  @Field(() => Int)
  async totalTransactions(): Promise<number> {
    const [_, count] = await CoreTransaction.findAndCount({
      accountId: this.id,
    });
    return count;
  }

  @Field(() => [CoreTransaction])
  async transactions(
    @Arg("after", { nullable: true }) after: number
  ): Promise<CoreTransaction[]> {
    return await CoreTransaction.getRepository().find({
      where: {
        accountId: this.id,
      },
      order: { date: "DESC" },
      skip: after,
      take: 50,
    });
  }

  @Field(() => PlaidInstitution)
  async institution() {
    return (
      (await PlaidInstitution.findByIds([this.institutionId])).pop() ?? null
    );
  }
}
