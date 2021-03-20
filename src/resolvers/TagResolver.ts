import { Tag } from "@entities";
import { Arg, Field, Mutation, InputType, Query, Resolver } from "type-graphql";

@InputType()
class TagCreateInput {
  @Field()
  tag: string;
}

@Resolver()
export class TagResolver {
  @Mutation(() => Tag)
  async createTag(
    @Arg("options", () => TagCreateInput)
    options: TagCreateInput
  ) {
    return await Tag.create({ tag: options.tag }).save();
  }

  @Query(() => [Tag])
  async tags() {
    var tags = await Tag.find();
    return tags;
  }
}
