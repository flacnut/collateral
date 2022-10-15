import { Arg, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode,
  Products,
  TransactionsGetRequest,
  InvestmentsTransactionsGetRequest,
} from "plaid";
import { client_id, dev_secret } from "../../plaidConfig.json";
import {
  PlaidTransaction, PlaidItem, PlaidInstitution, PlaidInvestmentHolding,
  PlaidHoldingTransaction, PlaidAccount
} from "../../src/entity/plaid";
import {
  createAccount, createHoldingTransaction, createInstitution,
  createInvestmentHolding, createItem, createSecurity, createTransaction
} from "../../src/utils/PlaidEntityHelper";
import { DateAmountAccountTuple, MatchTransfers } from "../../src/utils/AccountUtils";
import { CoreTransaction } from "../../src/entity/plaid/CoreTransaction";
import { Transfer } from "@entities";
import { UnsavedTransfer } from "../../src/entity/Transfer";

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

@ObjectType()
export class LinkTokenResult {
  @Field(() => String, { nullable: true })
  token: string;

  @Field(() => String, { nullable: true })
  error: string;
}

@InputType()
class PlaidLinkResponse {
  @Field(() => String)
  publicToken: string;

  @Field(() => String)
  linkSessionId: string;

  @Field(() => String)
  institutionId: string;
}

@Resolver()
export class PlaidResolver {
  @Query(() => LinkTokenResult)
  async getLinkToken() {
    return client
      .linkTokenCreate({
        user: {
          client_user_id: "4325",
        },
        client_name: "Plaid Test App",
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: "en",
        webhook: "https://sample-web-hook.com",
        redirect_uri: "https://localhost:3000/oauth",
      })
      .then((response) => {
        return {
          token: response.data.link_token,
        };
      })
      .catch((error: Error) => {
        console.error(error);
        return {
          error: error.message,
        };
      });
  }

  @Mutation(() => PlaidItem)
  async setPlaidLinkResponse(
    @Arg("plaidLinkResponse", () => PlaidLinkResponse) linkResponse: PlaidLinkResponse
  ) {
    let item: PlaidItem | null = null;
    try {
      const response = await client.itemPublicTokenExchange({
        public_token: linkResponse.publicToken,
      });

      if (response.data != null) {
        item = await createItem(
          response.data.item_id,
          response.data.access_token,
          linkResponse.institutionId,
        );
      }
    } catch (error) {
      console.error(error);
    }

    if (item != null) {
      const response = await client.institutionsGetById({
        institution_id: item.institutionId,
        country_codes: [CountryCode.Us],
        options: {
          include_optional_metadata: true,
        }
      });

      if (response.data != null) {
        await createInstitution(response.data.institution);
      }
    }

    if (item != null) {
      const response = await client.accountsGet({
        access_token: item.accessToken,
      });


      if (response.data != null) {
        await Promise.all(response.data.accounts.map(async (acc) => {
          if (item == null) {
            return;
          }
          return createAccount(item, acc);
        }));
      }
    }

    return item;
  }

  @Query(() => [PlaidAccount])
  async fetchAccounts(
    @Arg("itemId") itemId: string
  ) {
    const item = await PlaidItem.findOneOrFail(itemId);

    if (item != null) {
      const response = await client.accountsGet({
        access_token: item.accessToken,
      });


      if (response.data != null) {
        return await Promise.all(response.data.accounts.map(
          async (acc) => createAccount(item, acc)
        ));
      }
    }
    return [];
  }

  @Query(() => [PlaidTransaction])
  async fetchPlaidTransactions(
    @Arg("itemId") itemId: string
  ) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.transactionsGet({
      access_token: item.accessToken,
      start_date: '2022-01-01',
      end_date: '2022-12-31',
      options: {
        include_original_description: true,
        include_personal_finance_category: true,
      }
    });

    let transactions = response.data.transactions;
    const total_transactions = response.data.total_transactions;

    while (transactions.length < total_transactions) {
      const paginatedRequest: TransactionsGetRequest = {
        access_token: item.accessToken,
        start_date: '2022-01-01',
        end_date: '2022-12-31',
        options: {
          offset: transactions.length,
        },
      };
      const paginatedResponse = await client.transactionsGet(paginatedRequest);
      transactions = transactions.concat(
        paginatedResponse.data.transactions,
      );
    }

    return await Promise.all(transactions.map(createTransaction));
  }

  @Query(() => [PlaidInvestmentHolding])
  async fetchInvestmentHoldings(
    @Arg("itemId") itemId: string
  ) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.investmentsHoldingsGet({
      access_token: item.accessToken,
    });

    const allItems = await Promise.all([
      ...response.data.holdings.map(createInvestmentHolding),
      ...response.data.securities.map(createSecurity),
    ]);

    return allItems.filter(item => item instanceof PlaidInvestmentHolding);
  }

  @Query(() => [PlaidHoldingTransaction])
  async fetchInvestmentTransactions(
    @Arg("itemId") itemId: string
  ) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.investmentsTransactionsGet({
      access_token: item.accessToken,
      start_date: '2022-01-01',
      end_date: '2022-12-31',

    });

    let investment_transactions = response.data.investment_transactions;
    const total_transactions = response.data.total_investment_transactions;

    while (investment_transactions.length < total_transactions) {
      const paginatedRequest: InvestmentsTransactionsGetRequest = {
        access_token: item.accessToken,
        start_date: '2022-01-01',
        end_date: '2022-12-31',
        options: {
          offset: investment_transactions.length,
        },
      };
      const paginatedResponse = await client.investmentsTransactionsGet(paginatedRequest);
      investment_transactions = investment_transactions.concat(
        paginatedResponse.data.investment_transactions,
      );
    }

    const allItems = await Promise.all([
      ...response.data.investment_transactions.map(createHoldingTransaction),
      ...response.data.securities.map(createSecurity),
    ]);

    return allItems.filter(item => item instanceof PlaidHoldingTransaction);
  }

  @Query(() => PlaidInstitution)
  async getInstitution(
    @Arg("institutionId") institutionId: string
  ) {
    try {
      let institution = await PlaidInstitution.findOne(institutionId);

      if (institution) {
        return institution;
      }

      const response = await client.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
        options: {
          include_optional_metadata: true,
        }
      });

      if (response.data != null) {
        return await createInstitution(response.data.institution);
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  @Query(() => [PlaidInstitution])
  async getAllInstitutions() {
    return await PlaidInstitution.find();
  }

  @Query(() => [Transfer])
  async getPossibleTransfers() {
    const transactions = await CoreTransaction.find();

    const rawTransfers = MatchTransfers(
      transactions.map(t => {
        return {
          date: new Date(t.date),
          amountCents: t.amountCents,
          accountId: t.accountId,
          transactionId: t.id,
        } as DateAmountAccountTuple;
      }));

    let transfers = rawTransfers.map(transfer => {
      let to = transactions.filter(t => t.id === transfer.to)[0];
      let from = transactions.filter(t => t.id === transfer.from)[0];

      return {
        from,
        to,
        date: from.date,
        amountCents: transfer.amountCents,
      } as Transfer;
    });

    return transfers
  }

  @Mutation(() => [Transfer])
  async saveTransfers(
    @Arg("transfers", () => [UnsavedTransfer]) transfers: UnsavedTransfer[]
  ) {
    let transactionIds = transfers.map(transfer => { return [transfer.toId, transfer.fromId] }).flat()
    let transactions = await CoreTransaction.findByIds(transactionIds);

    if (transactions.length !== 2 * transfers.length) {
      console.error("Should be unreachable.");
    }

    let transferWrites = transfers.map(_transfer => {
      let from = transactions.find(t => t.id === _transfer.fromId);
      let to = transactions.find(t => t.id === _transfer.toId);
      if (from == null || to == null) {
        return null;
      }

      let transfer = new Transfer();
      transfer.id = _transfer.fromId;
      transfer.from = from;
      transfer.to = to;
      transfer.amountCents = to.amountCents;
      transfer.date = from.date;
      return transfer;
    }).filter(t => t != null) as Transfer[];

    await Transfer.getRepository().save(transferWrites);
    return transferWrites;
  }
}