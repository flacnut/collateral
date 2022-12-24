import moment from "moment";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { PlaidAccount, PlaidItem } from "../../src/entity/plaid";
import { CoreTransaction } from "../../src/entity/plaid/CoreTransaction";

import { client_id, dev_secret } from "../../plaidConfig.json";
import {
  createBalance,
  createHoldingTransaction,
  createSecurity,
  createTransaction,
} from "./PlaidEntityHelper";

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": client_id,
      "PLAID-SECRET": dev_secret,
    },
  },
});

const client = new PlaidApi(configuration);

export default {
  async refreshAllItems() {
    const allItems = await PlaidItem.find();
    const allAccounts = await PlaidAccount.find();
    const allTransactions = await CoreTransaction.find();

    const accountDates = allAccounts.reduce((a, acc: PlaidAccount) => {
      return {
        ...a,
        [acc.id]: "2022-01-01",
      };
    }, {} as { [accountId: string]: string });

    allTransactions.forEach((transaction) => {
      if (transaction.date > accountDates[transaction.accountId]) {
        accountDates[transaction.accountId] = transaction.date;
      }
    });

    // We don't use accountDates to get just the most recent, but we should.

    await Promise.all(
      allItems.map(async (item: PlaidItem) => {
        const accountResponse = await client.accountsGet({
          access_token: item.accessToken,
        });

        // balances
        await Promise.all(
          accountResponse.data?.accounts?.map((acc) =>
            createBalance(acc.account_id, acc.balances)
          )
        );

        // transactions
        const options = {
          access_token: item.accessToken,
          start_date: moment().subtract(2, "days").format("YYYY-MM-DD"),
          end_date: moment().add(2, "days").format("YYYY-MM-DD"),
          options: {
            include_original_description: true,
            include_personal_finance_category: true,
            offset: 0,
          },
        };

        const tResponse = await client.transactionsGet(options);
        let transactions = tResponse.data.transactions;
        const total_transactions = tResponse.data.total_transactions;

        while (transactions.length < total_transactions) {
          options.options.offset = transactions.length;
          const paginatedResponse = await client.transactionsGet(options);
          transactions = transactions.concat(
            paginatedResponse.data.transactions
          );
        }

        await Promise.all(transactions.map(createTransaction));

        // holding transactions & securities
        try {
          const h_options = {
            access_token: item.accessToken,
            start_date: moment().subtract(2, "years").format("YYYY-MM-DD"),
            end_date: moment().add(3, "days").format("YYYY-MM-DD"),
            options: {
              offset: 0,
            },
          };
          const hResponse = await client.investmentsTransactionsGet(h_options);

          let investment_transactions = hResponse.data.investment_transactions;
          let investment_securities = hResponse.data.securities;
          const total_h_transactions =
            hResponse.data.total_investment_transactions;

          while (investment_transactions.length < total_h_transactions) {
            h_options.options.offset = investment_transactions.length;
            const paginatedResponse = await client.investmentsTransactionsGet(
              h_options
            );
            investment_transactions = investment_transactions.concat(
              paginatedResponse.data.investment_transactions
            );
            investment_securities = investment_securities.concat(
              paginatedResponse.data.securities
            );
          }

          await Promise.all([
            ...investment_transactions.map(createHoldingTransaction),
            ...investment_securities.map(createSecurity),
          ]);
        } catch (_ignore) {
          // happens because some items don't have investment accounts.
          console.error(_ignore);
        }
      })
    );
  },
};
