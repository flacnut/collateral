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
import { PlaidTransaction, PlaidItem, PlaidInstitution, PlaidAccount, } from "../../src/entity/plaid";

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
        item = new PlaidItem();
        item.id = response.data.item_id;
        item.accessToken = response.data.access_token;
        item.institutionId = linkResponse.institutionId;
        await item.save();
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
        let institution = new PlaidInstitution();
        institution.id = item.institutionId;
        institution.name = response.data.institution.name;
        institution.logo = response.data.institution.logo ?? null;
        institution.primaryColor = response.data.institution.primary_color ?? null;
        institution.products = response.data.institution.products.join(':');
        institution.countryCodes = response.data.institution.country_codes.join(':');
        await institution.save();
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
          let account = new PlaidAccount();
          account.id = acc.account_id;
          account.itemId = item.id;
          account.institutionId = item.institutionId;
          account.mask = acc.mask;
          account.name = acc.name;
          account.officialName = acc.official_name;
          account.type = acc.type;
          account.subtype = acc.subtype;
          account.currency = acc.balances.iso_currency_code;
          return account.save();
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
      let transaction = new PlaidTransaction();
      transaction.id = t.transaction_id;
      transaction.accountId = t.account_id;
      transaction.amountCents = Math.floor(t.amount * 100);
      transaction.category = t.category?.join(',') ?? '';
      transaction.categoryId = t.category_id ?? '';
      transaction.currency = t.iso_currency_code;
      transaction.date = t.date;
      transaction.dateTime = t.datetime ?? '';
      transaction.authorizedDate = t.authorized_date ?? '';
      transaction.authorizedDateTime = t.authorized_datetime ?? '';
      transaction.locationJson = JSON.stringify(t.location);
      transaction.paymentChannel = t.payment_channel;
      transaction.paymentMetaJson = JSON.stringify(t.payment_meta);
      transaction.description = t.name;
      transaction.originalDescription = t.original_description ?? t.name;
      transaction.merchant = t.merchant_name ?? '';
      transaction.transactionCode = t.transaction_code ?? '';
      return transaction.save();
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
        console.dir(response.data);
        institution = new PlaidInstitution();
        institution.id = institutionId;
        institution.name = response.data.institution.name;
        institution.logo = response.data.institution.logo ?? null;
        institution.primaryColor = response.data.institution.primary_color ?? null;
        institution.products = response.data.institution.products.join(':');
        institution.countryCodes = response.data.institution.country_codes.join(':');
        await institution.save();
        return institution;
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }
}
