import fs from "fs";
import csv from "csv-parser";

type Transaction = {
  date: Date;
  description: string;
  amount_cents: number;
};

export type CSVFormat = {
  date: string;
  amount: string;
  description: string;
};

export interface TransactionParser {
  parse(fileName: string): Promise<Array<Transaction>>;
}

export class BasicCSVParser implements TransactionParser {
  private _format: CSVFormat;

  constructor(format: CSVFormat) {
    this._format = format;
  }

  private processRows(rows: Array<{ [key: string]: string }>) {
    return rows.map((row) => {
      return {
        date: new Date(Date.parse(row[this._format.date])),
        amount_cents: Math.floor(Number(row[this._format.amount]) * 100),
        description: row[this._format.description],
      };
    });
  }

  public async parse(fileName: string): Promise<Array<Transaction>> {
    return new Promise((resolve, reject) => {
      const rows: Array<{ [key: string]: string }> = [];
      let transactions: Transaction[] = [];
      try {
        fs.createReadStream(fileName)
          .pipe(csv())
          .on("data", (row) => rows.push(row))
          .on("end", () => {
            transactions = this.processRows(rows);
            resolve(transactions);
          });
      } catch (err) {
        reject(err);
      }
    });
  }
}
