/*import { Source } from "@entities";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class SourceResolver {
  @Mutation(() => Source)
  async createSource(@Arg("name") fileName: string) {
    return await Source.create({
      fileName,
      importDate: new Date(Date.now()),
    }).save();
  }

  @Query(() => [Source])
  async allSources() {
    var sources = await Source.find();
    return sources;
  }
}
*/
