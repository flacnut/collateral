import { Tag } from "@entities";
import { CustomInit__noCommit } from "./DBInit_NO_COMMIT";

export default async function init() {
  await Promise.all(
    [
      "transfer",
      "salary",
      "income",
      "expense",
      "one-off",
      "car",
      "fitness",
      "investment",
      "asset-purchase",
      "asset-sale",
    ].map(createTagIfNotExists)
  );

  await CustomInit__noCommit();
}

async function createTagIfNotExists(tag: string) {
  const tagObj = await Tag.findOne({ tag });
  if (tagObj == null) {
    await Tag.create({ tag }).save();
  }
}
