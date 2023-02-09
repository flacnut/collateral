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
} from 'typeorm';
import { Field, Int, ObjectType, registerEnumType } from 'type-graphql';
import { Account } from '@entities';
import { Tag } from '@entities';

export enum TransactionClassification {
  Duplicate = 'duplicate',
  Income = 'income',
  Expense = 'expense',
  Recurring = 'recurring',
  Transfer = 'transfer',
  Investment = 'investment',
  Hidden = 'hidden',
}

registerEnumType(TransactionClassification, {
  name: 'TransactionClassification', // this one is mandatory
  description: 'Some general transaction classifications', // this one is optional
});

@ObjectType()
@Entity('transaction')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class CoreTransaction extends BaseEntity {
  @Field()
  @PrimaryColumn('text', { nullable: false, unique: true })
  id: string;

  @Field()
  @Column('text')
  accountId: string;

  @Field()
  @Column('text')
  description: string;

  @Field(() => Int)
  @Column('int')
  amountCents: number;

  @Field()
  @Column('text')
  date: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  currency: string | null;

  @DeleteDateColumn()
  deletedDate: Date;

  @Field(() => [Tag])
  @JoinTable()
  @ManyToMany(() => Tag, { onDelete: 'NO ACTION' })
  tags: Promise<Tag[]>;

  @Column('text', { nullable: true })
  @Field(() => TransactionClassification, { nullable: true })
  classification: TransactionClassification;

  // Additional Fields

  @Field(() => Number)
  amount() {
    return this.amountCents / 100;
  }

  @AfterLoad()
  async applyAmountUpdates() {
    const account = await Account.findOne({
      where: { id: this.accountId },
      cache: true,
    });
    if (account?.invertTransactions) {
      this.amountCents *= -1;
    }
  }

  @Field(() => Account)
  async account() {
    return await Account.findOne({
      where: { id: this.accountId },
      cache: true,
    });
  }

  // TODO: Balance in dollars
  // TODO: Invert account transactions (and balance)
  //       Cache results for perf.
}
