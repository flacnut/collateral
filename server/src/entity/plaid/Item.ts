import { Field, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { PlaidAccount } from "./Account";
import { PlaidInstitution } from "./Institution";

@Entity()
@ObjectType()
export class PlaidItem extends BaseEntity {

  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  // not a field to be accessed 
  @Column("text")
  accessToken: string;

  @Field()
  @Column("text")
  institutionId: string;

  @Field(() => [PlaidAccount])
  @OneToMany(() => PlaidAccount, (account) => account.item, { eager: true })
  accounts: PlaidAccount[];

  @Field(() => PlaidInstitution)
  async institution() {
    return (await PlaidInstitution.findByIds([this.institutionId])).pop() ?? null;
  }
}
