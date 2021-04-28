import { Account, Tag, TagRule } from "@entities";
import {
  Arg,
  Field,
  Int,
  Mutation,
  InputType,
  Query,
  Resolver,
} from "type-graphql";

@InputType()
class TagCreateInput {
  @Field()
  tag: string;
}

@InputType()
class TagRuleCreateInput {
  @Field({ nullable: false })
  name: string;

  @Field(() => String, { nullable: true })
  descriptionContains: string | null;

  @Field(() => Int, { nullable: true })
  minimumAmount: number | null;

  @Field(() => Int, { nullable: true })
  maximumAmount: number | null;

  @Field(() => [Int], { nullable: true })
  forAccounts: Array<number> | null;

  @Field(() => [Int], { nullable: false })
  tagsToAdd: Array<number>;
}

@Resolver()
export class TagResolver {
  @Mutation(() => Tag)
  async createTag(
    @Arg("options", () => TagCreateInput)
    options: TagCreateInput
  ) {
    const alreadyExists = await Tag.findOne({ tag: options.tag });

    if (alreadyExists) {
      return alreadyExists;
    }

    return await Tag.create({ tag: options.tag }).save();
  }

  @Mutation(() => Boolean)
  async deleteTag(@Arg("id", () => Int) id: number) {
    const tagToRemove = await Tag.find({ id });

    /* TODO: Handle cascade deletes */

    await Tag.remove(tagToRemove);
    return true;
  }

  @Query(() => [Tag])
  async tags() {
    var tags = await Tag.find();
    return tags;
  }

  @Mutation(() => TagRule)
  async createTagRule(
    @Arg("options", () => TagRuleCreateInput) options: TagRuleCreateInput
  ) {
    if (
      options.maximumAmount &&
      options.minimumAmount &&
      options.minimumAmount > options.maximumAmount
    ) {
      throw new Error("Invalid minimum and maximum amount.");
    }

    const tagsToAdd = await Tag.findByIds(options.tagsToAdd);
    const forAccounts = await Account.findByIds(options.forAccounts ?? []);
    const thisTag = await this.createTag({ tag: `Rule: ${options.name}` });

    const newTagRule = await TagRule.create({
      name: options.name,
      minimumAmount: options.minimumAmount,
      maximumAmount: options.maximumAmount,
      descriptionContains: options.descriptionContains,
    }).save();

    newTagRule.thisTag = thisTag;
    newTagRule.forAccounts = Promise.resolve(forAccounts);
    newTagRule.tagsToAdd = Promise.resolve(tagsToAdd);
    newTagRule.save();

    return newTagRule;
  }
}
