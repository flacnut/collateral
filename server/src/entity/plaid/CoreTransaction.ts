import { Tag } from "@entities";
import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryColumn,
  TableInheritance,
  AfterLoad,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
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

  @DeleteDateColumn()
  deletedDate: Date;

  @Field(() => [Tag])
  @JoinTable()
  @ManyToMany(() => Tag, { onDelete: "NO ACTION" })
  tags: Promise<Tag[]>;

  // Additional Fields

  @Field(() => Number)
  amount() {
    return this.amountCents / 100;
  }

  @Field(() => TransactionClassification)
  async classification(): Promise<TransactionClassification> {
    return TransactionClassification.Transfer;
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

  @Field(() => PlaidAccount)
  async account() {
    return await PlaidAccount.findOne({
      where: { id: this.accountId },
      cache: true,
    })
  }

  // TODO: Balance in dollars
  // TODO: Invert account transactions (and balance)
  //       Cache results for perf.
}
