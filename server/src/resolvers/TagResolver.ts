import {
  Arg,
  Field,
  Int,
  Mutation,
  InputType,
  Query,
  Resolver,
} from 'type-graphql';
import { Tag } from '@entities';

@InputType()
class TagCreateInput {
  @Field()
  tag: string;
}

@Resolver()
export class TagResolver {
  @Mutation(() => Tag)
  async createTag(
    @Arg('options', () => TagCreateInput)
    options: TagCreateInput,
  ) {
    const alreadyExists = await Tag.findOne({ name: options.tag });

    if (alreadyExists) {
      return alreadyExists;
    }

    return await Tag.create({ name: options.tag }).save();
  }

  @Mutation(() => Boolean)
  async deleteTag(@Arg('id', () => Int) id: number) {
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
}
