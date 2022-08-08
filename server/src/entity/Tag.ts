import { Field, ObjectType, Int } from "type-graphql";
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
@ObjectType()
export class Tag extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("text", { nullable: false })
  tag: string;

  @Field(() => Boolean)
  @Column("boolean", { default: false })
  autopopulate: boolean;
}
