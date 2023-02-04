import csv from 'csv-parser';
import fs from 'fs';

export type ParsedTransaction = {
  date: Date;
  description: string;
  amount_cents: number;
};

export type CSVFormat = {
  date: string;
  amount: string;
  credit: string;
  description: string;
};

export interface TransactionParser {
  parse(fileName: string): Promise<Array<ParsedTransaction>>;
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
        amount_cents: row[this._format.amount]
          ? Math.floor(Number(row[this._format.amount]) * 100)
          : Math.floor(Number(row[this._format.credit]) * 100),
        description: row[this._format.description],
      };
    });
  }

  public async parse(fileName: string): Promise<Array<ParsedTransaction>> {
    return new Promise((resolve, reject) => {
      const rows: Array<{ [key: string]: string }> = [];
      let transactions: ParsedTransaction[] = [];
      try {
        fs.createReadStream(fileName)
          .pipe(csv())
          .on('data', (row) => rows.push(row))
          .on('end', () => {
            transactions = this.processRows(rows);
            resolve(transactions);
          });
      } catch (err) {
        reject(err);
      }
    });
  }
}
