import { CustomInit__noCommit } from './DBInit_NO_COMMIT';
import { Tag } from '@entities';

export default async function init() {
  await Promise.all([].map(createTagIfNotExists));
  await CustomInit__noCommit();
}

async function createTagIfNotExists(tag: string) {
  const tagObj = await Tag.findOne({ name: tag });
  if (tagObj == null) {
    await Tag.create({ name: tag }).save();
  }
}
