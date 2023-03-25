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
class ChangeEvent {
  @Field()
  date: string;

  @Field()
  column: string;

  @Field(() => String, { nullable: true })
  oldValue: string | null;

  @Field()
  newValue: string;
}

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

  @Field(() => [Tag], { nullable: true })
  @JoinTable()
  @ManyToMany(() => Tag, { onDelete: 'NO ACTION' })
  tags: Promise<Tag[]>;

  @Column('text', { nullable: true })
  @Field(() => TransactionClassification, { nullable: true })
  classification: TransactionClassification;

  @Column('text', { default: '[]', nullable: false })
  serializedChangeLog: string;

  // Do not directly change this! Use appendChangeLog
  @Field(() => [ChangeEvent])
  changeLog: ChangeEvent[];

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

  @AfterLoad()
  async setChangeLog() {
    this.changeLog = JSON.parse(this.serializedChangeLog);
  }

  async appendChangeLog(change: ChangeEvent) {
    this.changeLog = this.changeLog?.length
      ? this.changeLog.concat([change])
      : [change];
    this.serializedChangeLog = JSON.stringify(this.changeLog);
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
