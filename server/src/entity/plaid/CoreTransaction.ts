import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryColumn,
  TableInheritance,
  AfterLoad,
} from "typeorm";
import { PlaidAccount } from "./Account";

enum TransactionClassification {
  Duplicate,
  Salary,
  Expense,
  Recurring,
  Transfer,
}

registerEnumType(TransactionClassification, {
  name: "TransactionClassification", // this one is mandatory
  description: "Some general transaction classifications", // this one is optional
});

@ObjectType()
@Entity("transaction")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class CoreTransaction extends BaseEntity {
  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  @Field()
  @Column("text")
  accountId: string;

  @Field()
  @Column("text")
  description: string;

  @Field(() => Int)
  @Column("int")
  amountCents: number;

  @Field()
  @Column("text")
  date: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  currency: string | null;

  // Additional Fields

  @Field(() => Number)
  amount() {
    return this.amountCents / 100;
  }

  @Field(() => TransactionClassification)
  async classification(): Promise<TransactionClassification> {
    return TransactionClassification.Duplicate;
  }

  @AfterLoad()
  async applyAmountUpdates() {
    const account = await PlaidAccount.findOne({
      where: { id: this.accountId },
      cache: true,
    });
    if (account?.invertTransactions) {
      this.amountCents *= -1;
    }
  }

  // TODO: Balance in dollars
  // TODO: Invert account transactions (and balance)
  //       Cache results for perf.
}
