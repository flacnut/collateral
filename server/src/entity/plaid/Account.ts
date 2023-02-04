import { Arg, Field, Int, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { AccountBalance } from "./AccountBalance";
import { CoreTransaction } from "./CoreTransaction";
import { Institution } from "./Institution";
import { PlaidItem } from "./PlaidItem";

@Entity("account")
@ObjectType()
export class Account extends BaseEntity {
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

  // non-plaid fields

  @Field(() => Boolean)
  @Column("boolean", { default: true })
  invertTransactions: boolean;

  @Field(() => Boolean)
  @Column("boolean", { default: true })
  invertBalances: boolean;

  // Additional Fields

  @ManyToOne(() => PlaidItem, (item: PlaidItem) => item.accounts)
  item: PlaidItem;

  @Field(() => AccountBalance)
  async latestBalance() {
    const balances = await AccountBalance.find({
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

  @Field(() => CoreTransaction, { nullable: true })
  async latestTransaction() {
    return await CoreTransaction.findOne({
      where: {
        accountId: this.id,
      },
      order: { date: "DESC" },
    });
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

  @Field(() => Institution)
  async institution() {
    return (await Institution.findByIds([this.institutionId])).pop() ?? null;
  }

  @Field(() => String)
  async status() {
    const query = CoreTransaction.createQueryBuilder("transaction");
    query.where({ accountId: this.id });
    query.select("MAX(transaction.date)", "max");
    const { max } = (await query.getRawOne()) as { max: string };

    switch (true) {
      case max == null:
        return "inactive";
      case isOlderThanOneMonth(max):
        return "stale";
      default:
        return "active";
    }
  }
}

function isOlderThanOneMonth(date: string): boolean {
  const tdate = new Date(date);
  const now = new Date();
  const MSEC_IN_ONE_MONTH = 31 * 24 * 60 * 60 * 1000;

  return now.getTime() - tdate.getTime() > MSEC_IN_ONE_MONTH;
}
