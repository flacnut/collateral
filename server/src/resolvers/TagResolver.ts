import {
  Arg,
  Field,
  Int,
  Mutation,
  InputType,
  Query,
  Resolver,
  ObjectType,
} from 'type-graphql';
import { Tag } from '@entities';

@InputType()
class TagCreateInput {
  @Field()
  tag: string;
}

@ObjectType()
class TagFrequency {
  @Field(() => [Tag], { nullable: true })
  tags: Tag[];

  @Field(() => Int)
  count: number;
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

  @Query(() => [TagFrequency])
  async tagsByFrequency() {
    const tagNameMap: { [key: number]: Tag } = {};
    (await Tag.find()).forEach((t) => (tagNameMap[t.id] = t));

    const tagsFreqResults = (await Tag.getRepository().query(`
      SELECT 
        count(transactionId) as count, 
        tags 
      FROM (
        SELECT 
          transactionId, 
          group_concat(tagId) as tags 
        FROM transaction_tags_tag 
        GROUP BY transactionId
      ) 
      GROUP BY tags`)) as [{ count: number; tags: string }];

    return tagsFreqResults.map((result): TagFrequency => {
      return {
        count: result.count,
        tags: result.tags.split(',').map((id) => tagNameMap[Number(id)]),
      };
    });
  }

  @Query(() => [Tag])
  async tags() {
    var tags = await Tag.find();
    return tags;
  }
}
