import { Arg, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode,
  Products,
  TransactionsGetRequest,
} from "plaid";
import { client_id, dev_secret } from "../../plaidConfig.json";
import { PlaidTransaction, PlaidItem, PlaidInstitution } from "../../src/entity/plaid";
import { createAccount, createInstitution, createItem, createTransaction } from "../../src/utils/PlaidEntityHelper";

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
        await Promise.resolve(response.data.accounts.map(async (acc) => {
          if (item == null) {
            return;
          }
          return createAccount(item, acc);
        }));
      }
    }

    return item;
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

    return await Promise.resolve(transactions.map(async (t) => {
      return createTransaction(t);
    }));
  }

  @Query(() => [PlaidTransaction])
  async fetchInvestmentHoldings(
    @Arg("itemId") itemId: string
  ) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.investmentsHoldingsGet({
      access_token: item.accessToken,
    });

    console.dir(response.data.holdings);
    console.dir(response.data.securities);
    return [];
  }

  @Query(() => [PlaidTransaction])
  async fetchInvestmentTransactions(
    @Arg("itemId") itemId: string
  ) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.investmentsTransactionsGet({
      access_token: item.accessToken,
      start_date: '2020-01-01',
      end_date: '2022-09-30',
    });

    console.dir(response.data.investment_transactions);
    return [];
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
}
