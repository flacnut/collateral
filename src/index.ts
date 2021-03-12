import "module-alias/register";
import yargs from "yargs";

import startServer from "./server";
import { BasicCSVParser } from "./cli/BasicCSVParser";

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
          demandOption: true,
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
          description: "The column heading for the amount value.",
          demandOption: true,
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
      descColumn: string;
      file: string;
    }) => {
      const parser = new BasicCSVParser({
        date: argv.dateColumn,
        amount: argv.amountColumn,
        description: argv.descColumn,
      });
      const transactions = await parser.parse(argv.file);
      console.dir(transactions);
    }
  )
  .demandCommand(1)
  .help().argv;
