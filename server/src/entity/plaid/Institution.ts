import { Field, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity()
@ObjectType()
export class PlaidInstitution extends BaseEntity {
  @Field()
  @PrimaryColumn("text", { nullable: false, unique: true })
  id: string;

  @Field()
  @Column("text")
  name: string;

  @Field()
  @Column("text")
  countryCodes: string;

  @Field()
  @Column("text")
  products: string;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  primaryColor: string | null;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  url: string | null;

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  logo: string | null;
}
