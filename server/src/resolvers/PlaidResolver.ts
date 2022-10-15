import { Arg, Field, InputType, Int, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode,
  Products,
  TransactionsGetRequest,
} from "plaid";
import { client_id, dev_secret } from "../../plaidConfig.json";
import { PlaidTransaction, PlaidItem, PlaidInstitution, PlaidInvestmentHolding, PlaidHoldingTransaction, PlaidAccount } from "../../src/entity/plaid";
import { createAccount, createHoldingTransaction, createInstitution, createInvestmentHolding, createItem, createSecurity, createTransaction } from "../../src/utils/PlaidEntityHelper";
import { DateAmountAccountTuple, MatchTransfers } from "../../src/utils/AccountUtils";
import { CoreTransaction } from "../../src/entity/plaid/CoreTransaction";

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

@ObjectType()
export class CoreTransfer {
  @Field(() => CoreTransaction)
  to: CoreTransaction;

  @Field(() => CoreTransaction)
  from: CoreTransaction;

  @Field(() => String)
  date: string;

  @Field(() => Int)
  amountCents: number;
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
      start_date: '2020-01-01',
      end_date: '2022-09-30',
    });

    let transactions = response.data.transactions;
    const total_transactions = response.data.total_transactions;

    while (transactions.length < total_transactions) {
      const paginatedRequest: TransactionsGetRequest = {
        access_token: item.accessToken,
        start_date: '2020-01-01',
        end_date: '2022-09-30',
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
      start_date: '2020-01-01',
      end_date: '2022-09-30',
    });

    const allItems = await Promise.all([
      ...response.data.investment_transactions.map(createHoldingTransaction),
      ...response.data.securities.map(createSecurity),
    ]);

    console.dir(allItems);

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


      console.dir(response.data?.institution);

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

  @Query(() => [CoreTransfer])
  async getPlaidTransfers() {
    const transactions = await CoreTransaction.find();

    const transfers = MatchTransfers(
      transactions.filter(t => t.accountId === '4xxRwNw5kJsqmNa79L56uXndYr4zy9fnz6ebP' || t.accountId === 'v66xPOPYXysML5A4e0b6ivOgadmQpAU0PJX3N').map(t => {
        return {
          date: new Date(t.date),
          amountCents: t.amountCents,
          accountId: t.accountId,
          transactionId: t.id,
        } as DateAmountAccountTuple;
      }));

    let coreTransfers = transfers.map(transfer => {
      let to = transactions.filter(t => t.id === transfer.to)[0];
      let from = transactions.filter(t => t.id === transfer.from)[0];

      return {
        from,
        to,
        date: from.date,
        amountCents: transfer.amountCents,
      } as CoreTransfer;
    });

    return coreTransfers
  }
}


//TODO: Make investment transaction and normal transaction extend some core trasaction class, otherwise its hard to do transfers.