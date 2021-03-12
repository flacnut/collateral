import "module-alias/register";
import startServer from "./server";

import yargs from "yargs";

console.dir(process.argv.slice(2));

yargs(process.argv.slice(2))
  .command(
    "start-server",
    "Starts the graphQL and Web server",
    (_) => {},
    (_) => {
      startServer();
    }
  )
  .demandCommand(1)
  .help().argv;
