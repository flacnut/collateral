import "module-alias/register";
import yargs from "yargs";

import startServer from "./server";
import { BasicCSVParser } from "./cli/parser/BasicCSVParser";
import { IngestUtils } from "./utils/IngestUtils";
import { readdirSync } from "fs";
import path from "path";

yargs(process.argv.slice(2))
  .scriptName("collateral-cli")
  .usage("$0 <cmd> [args]")
  .command(
    "start-server",
    "Starts the graphQL and Web server",
    (_) => {},
    (_) => {
      startServer();
    }
  )
  .command(
    "import",
    "Imports a file into the database",
    (yargs) => {
      yargs
        .usage(
          `Example:\nimport --file testFile.csv --parser csv -d "Posting Date" -a "Amount" --desc "Extended Description"`
        )
        .option("f", {
          alias: "file",
          description: "The file to be imported",
        })
        .option("dir", {
          description: "The directory where files can be found.",
        })
        .option("p", {
          alias: "parser",
          description: "The parser to use",
          choices: ["csv"],
          default: "csv",
        })
        .option("d", {
          alias: "date-column",
          description: "The column heading for the date value.",
          demandOption: true,
        })
        .option("a", {
          alias: "amount-column",
          description: "The column heading for the amount or debit value.",
          demandOption: true,
        })
        .option("c", {
          alias: "credit-column",
          description: "The column heading for the credit value.",
        })
        .option("desc", {
          alias: "desc-column",
          description: "The column heading for the transaction description.",
          demandOption: true,
        });
    },
    async (argv: {
      dateColumn: string;
      amountColumn: string;
      creditColumn: string;
      descColumn: string;
      file?: string;
      dir?: string;
    }) => {
      const parser = new BasicCSVParser({
        date: argv.dateColumn,
        amount: argv.amountColumn,
        credit: argv.creditColumn,
        description: argv.descColumn,
      });

      const { file, dir } = argv;
      const ingestUtils = new IngestUtils();

      if (dir != null) {
        const files = readdirSync(dir);
        const parseFuncs: Array<() => Promise<void>> = files.map(
          (f: string) => {
            return async () => {
              const trans = await parser.parse(path.join(dir, f));
              await ingestUtils.storeTransactions(path.join(dir, f), trans);
            };
          }
        );

        return await parseFuncs.reduce(
          (prev, cur) => prev.then(cur),
          Promise.resolve()
        );
      } else if (file != null) {
        try {
          const transactions = await parser.parse(file);
          await ingestUtils.storeTransactions(file, transactions);
        } catch (err) {
          console.error(err);
        }
      }
    }
  )
  .demandCommand(1)
  .help().argv;
