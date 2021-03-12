import { Source } from "@entities";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class SourceResolver {
  @Mutation(() => Boolean)
  async createSource(@Arg("name") fileName: string) {
    await Source.insert({ fileName, importDate: new Date(Date.now()) });
    return true;
  }

  @Query(() => [Source])
  async sources() {
    var sources = await Source.find();
    console.dir(sources);
    return sources;
  }
}
