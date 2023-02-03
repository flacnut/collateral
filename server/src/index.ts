import "module-alias/register";
import startServer from "./server";
import schedule from "node-schedule";
import PlaidFetcherUtil from "./utils/PlaidFetcherUtil";

startServer();
startSchedules();

function startSchedules() {
  schedule.scheduleJob("30 23 * * *", async () => {
    // TODO: logging
    await PlaidFetcherUtil.refreshAllItems();
  });

  process.on("SIGINT", () => {
    schedule.gracefulShutdown().then(() => process.exit(0));
  });
}
