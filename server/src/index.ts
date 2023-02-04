import PlaidFetcherUtil from './utils/PlaidFetcherUtil';
import schedule from 'node-schedule';
import startServer from './server';
import 'module-alias/register';

startServer();
startSchedules();

function startSchedules() {
  schedule.scheduleJob('30 23 * * *', async () => {
    // TODO: logging
    await PlaidFetcherUtil.refreshAllItems();
  });

  process.on('SIGINT', () => {
    schedule.gracefulShutdown().then(() => process.exit(0));
  });
}
