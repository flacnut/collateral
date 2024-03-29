import {
  createOrUpdateBalance,
  createOrUpdateInvestmentTransaction,
  createOrUpdateSecurity,
} from './PlaidEntityHelper';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  TransactionsSyncResponse,
} from 'plaid';
import { createOrUpdateTransaction } from './PlaidEntityHelper';
import { Institution, PlaidItem, Transaction } from '@entities';
import moment from 'moment';

import { client_id, dev_secret } from '../../plaidConfig.json';

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': client_id,
      'PLAID-SECRET': dev_secret,
    },
  },
});

const client = new PlaidApi(configuration);

export default {
  async refreshAllItems() {
    const allItems = await PlaidItem.find();

    try {
      await Promise.all(
        allItems.map(async (item: PlaidItem) => {
          const accountResponse = await client.accountsGet({
            access_token: item.accessToken,
          });

          // balances
          await Promise.all(
            accountResponse.data?.accounts?.map((acc) =>
              createOrUpdateBalance(acc.account_id, acc.balances),
            ),
          );

          // transactions
          await this.syncTransactions(item);

          // holding transactions & securities
          let institution = await Institution.findOne({
            id: item.institutionId,
          });
          if (institution?.products.split(',').includes('investments')) {
            await this.fetchHoldingTransactions(item);
          }
        }),
      );
    } catch (err) {
      console.error(err);
    }
  },

  async fetchHoldingTransactions(item: PlaidItem) {
    try {
      const h_options = {
        access_token: item.accessToken,
        start_date: '2023-04-01',
        end_date: moment().add(3, 'days').format('YYYY-MM-DD'),
        options: {
          offset: 0,
        },
      };
      const hResponse = await client.investmentsTransactionsGet(h_options);

      let investment_transactions = hResponse.data.investment_transactions;
      let investment_securities = hResponse.data.securities;
      const total_h_transactions = hResponse.data.total_investment_transactions;

      while (investment_transactions.length < total_h_transactions) {
        h_options.options.offset = investment_transactions.length;
        const paginatedResponse = await client.investmentsTransactionsGet(
          h_options,
        );
        investment_transactions = investment_transactions.concat(
          paginatedResponse.data.investment_transactions,
        );
        investment_securities = investment_securities.concat(
          paginatedResponse.data.securities,
        );
      }

      await Promise.all([
        ...investment_transactions.map(createOrUpdateInvestmentTransaction),
        ...investment_securities.map(createOrUpdateSecurity),
      ]);
    } catch (_ignore) {
      // happens because some items don't have investment accounts.
      console.error(_ignore);
    }
  },

  async syncTransactions(item: PlaidItem) {
    const options = {
      access_token: item.accessToken,
      cursor: item.transactionsCursor ?? undefined,
      count: 500,
      options: {
        include_original_description: true,
        include_personal_finance_category: true,
      },
    };

    let response = await client.transactionsSync(options);
    await this.handleSyncResponse(item, response.data);

    while (response.data.has_more) {
      options.cursor = response.data.next_cursor;
      response = await client.transactionsSync(options);
      await this.handleSyncResponse(item, response.data);
    }
  },

  async handleSyncResponse(item: PlaidItem, data: TransactionsSyncResponse) {
    try {
      // Added
      for (let i = 0; i < data.added.length; i++) {
        await createOrUpdateTransaction(data.added[i]);

        // if this transaction replaces a pending transaction
        let pendingId = data.added[i].pending_transaction_id;
        let pendingTransaction = null;
        if (pendingId != null) {
          pendingTransaction = await Transaction.findOne({
            id: pendingId,
          });
        }
        if (pendingTransaction != null) {
          await Transaction.softRemove(pendingTransaction);
        }
      }

      // Modified
      for (let i = 0; i < data.modified.length; i++) {
        await createOrUpdateTransaction(data.modified[i]);
      }

      // Removed
      const transactions = await Transaction.findByIds(data.removed);
      await Transaction.softRemove(transactions);

      // Update Cursor
      item.transactionsCursor = data.next_cursor;
      await item.save();
    } catch (err) {
      console.error(err);
      throw new Error(
        `Unable to write sync-transactions updates: ${err.message}`,
      );
    }
  },
};
