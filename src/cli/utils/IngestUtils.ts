import { ParsedTransaction } from "../parser/BasicCSVParser";
import { Transaction, Source, Tag } from "@entities";
import { createConnection, getConnectionOptions, Connection } from "typeorm";

export class IngestUtils {
  private _connection: Connection | null;

  public async getConnection() {
    const options = await getConnectionOptions(
      process.env.NODE_ENV || "development"
    );
    this._connection = await createConnection({ ...options, name: "default" });
  }

  public async storeTransactions(
    fileName: string,
    transactions: ParsedTransaction[]
  ): Promise<void> {
    if (!this._connection) {
      await this.getConnection();
    }

    const source = await Source.create({
      fileName,
      importDate: new Date(Date.now()),
    }).save();

    const tagNames = (await Tag.find()).map((tag) => tag.tag);
    const newtagNamesNeeded: string[] = [];

    transactions.forEach((t) => {
      const yearTag = `Year:${t.date.getFullYear()}`;
      if (
        tagNames.indexOf(yearTag) === -1 &&
        newtagNamesNeeded.indexOf(yearTag) === -1
      ) {
        newtagNamesNeeded.push(yearTag);
      }

      const monthTag = `Month:${t.date.getMonth()}`;
      if (
        tagNames.indexOf(monthTag) === -1 &&
        newtagNamesNeeded.indexOf(monthTag) === -1
      ) {
        newtagNamesNeeded.push(monthTag);
      }
    });

    console.dir(newtagNamesNeeded);

    await Promise.all(
      newtagNamesNeeded.map(
        async (tagName) => await Tag.create({ tag: tagName }).save()
      )
    );

    const tags = await Tag.find();

    await Promise.all(
      transactions.map(async (t: ParsedTransaction) => {
        let tt = await Transaction.create({
          date: t.date,
          originalDescription: t.description,
          amountCents: t.amount_cents,
        }).save();
        tt.source = Promise.resolve(source);

        let yearTag = tags.find(
          (tag) => tag.tag === `Year:${t.date.getFullYear()}`
        );
        let monthTag = tags.find(
          (tag) => tag.tag === `Month:${t.date.getMonth()}`
        );
        tt.tags = Promise.resolve([yearTag as Tag, monthTag as Tag]);

        await tt.save();
      })
    );

    return;
  }
}
