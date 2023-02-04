import { Field, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { Account, Institution } from "@entities";

@Entity()
@ObjectType()
export class PlaidItem extends BaseEntity {
  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  // not a field to be accessed
  @Column("text")
  accessToken: string;

  // not a field to be accessed
  @Column("text", { nullable: true })
  transactionsCursor: string | null;

  @Field()
  @Column("text")
  institutionId: string;

  @Field(() => [Account])
  @OneToMany(() => Account, (account) => account.item, { eager: true })
  accounts: Account[];

  /* Dynamic / Generated fields */

  @Field(() => Institution)
  async institution() {
    return (await Institution.findByIds([this.institutionId])).pop() ?? null;
  }
}
