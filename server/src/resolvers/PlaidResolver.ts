import {
  createAccount,
  createOrUpdateInvestmentTransaction,
  createInstitution,
  createInvestmentHolding,
  createOrUpdateItem,
  createOrUpdateSecurity,
  createTransaction,
} from '../../src/utils/PlaidEntityHelper';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode,
  Products,
  TransactionsGetRequest,
  InvestmentsTransactionsGetRequest,
  LinkTokenCreateRequest,
} from 'plaid';
import {
  Transaction,
  PlaidItem,
  Institution,
  InvestmentHolding,
  InvestmentTransaction,
  Account,
} from '@entities';
import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import PlaidFetcherUtil from '../../src/utils/PlaidFetcherUtil';
import { client_id, dev_secret } from '../../plaidConfig.json';
import { FindManyOptions } from 'typeorm';

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': client_id,
      'PLAID-SECRET': dev_secret,
    },
  },
});

const DEFAULT_LINK_OPTIONS = {
  user: {
    client_user_id: '4325',
  },
  client_name: 'Plaid Test App',
  products: [Products.Transactions],
  country_codes: [CountryCode.Us],
  language: 'en',
  webhook: 'https://sample-web-hook.com',
  redirect_uri: 'https://localhost:3000/oauth',
};

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
  async getLinkToken(@Arg('itemId', { nullable: true }) itemId: string) {
    const linkTokenRequestOptions = JSON.parse(
      JSON.stringify(DEFAULT_LINK_OPTIONS),
    ) as LinkTokenCreateRequest;

    if (itemId) {
      const item = await PlaidItem.findOne(itemId);
      if (!item?.accessToken) {
        console.error(
          'Plaid item without an access token, unable to re-establish connection.',
        );
      } else {
        linkTokenRequestOptions.access_token = item?.accessToken;
      }
    }

    return await client
      .linkTokenCreate(linkTokenRequestOptions)
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

  @Query(() => LinkTokenResult)
  async getLinkTokenForAccount(
    @Arg('accountId', { nullable: false }) accountId: string,
  ) {
    const account = await Account.findOneOrFail({ id: accountId });
    const item = await PlaidItem.findOneOrFail({ id: account.itemId });

    const linkTokenRequestOptions = JSON.parse(
      JSON.stringify(DEFAULT_LINK_OPTIONS),
    ) as LinkTokenCreateRequest;

    linkTokenRequestOptions.access_token = item?.accessToken;
    const clientResponse = await client.linkTokenCreate(
      linkTokenRequestOptions,
    );

    return {
      token: clientResponse.data.link_token,
    };
  }

  @Mutation(() => PlaidItem)
  async setPlaidLinkResponse(
    @Arg('plaidLinkResponse', () => PlaidLinkResponse)
    linkResponse: PlaidLinkResponse,
  ) {
    let item: PlaidItem | null = null;
    try {
      const response = await client.itemPublicTokenExchange({
        public_token: linkResponse.publicToken,
      });

      if (response.data != null) {
        item = await createOrUpdateItem(
          response.data.item_id,
          response.data.access_token,
          linkResponse.institutionId,
        );
      }
    } catch (error) {
      console.error(error);
      return;
    }

    if (item != null) {
      const response = await client.institutionsGetById({
        institution_id: item.institutionId,
        country_codes: [CountryCode.Us],
        options: {
          include_optional_metadata: true,
        },
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
        await Promise.all(
          response.data.accounts.map(async (acc) => {
            if (item == null) {
              return;
            }
            return createAccount(item, acc);
          }),
        );
      }
    }

    return item;
  }

  @Query(() => Boolean)
  async refreshPlaidItems() {
    await PlaidFetcherUtil.refreshAllItems();
    return true;
  }

  @Query(() => [Account])
  async fetchAccounts(@Arg('itemId') itemId: string) {
    const item = await PlaidItem.findOneOrFail(itemId);

    if (item != null) {
      const response = await client.accountsGet({
        access_token: item.accessToken,
      });

      if (response.data != null) {
        return await Promise.all(
          response.data.accounts.map(async (acc) => createAccount(item, acc)),
        );
      }
    }
    return [];
  }

  // WARNING:
  // You probably want `refreshPlaidItems` instead!!
  @Query(() => [Transaction])
  async fetchTransactions(@Arg('itemId') itemId: string) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.transactionsGet({
      access_token: item.accessToken,
      start_date: '2022-01-01',
      end_date: '2022-12-31',
      options: {
        include_original_description: true,
        include_personal_finance_category: true,
      },
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
          include_original_description: true,
          include_personal_finance_category: true,
        },
      };
      const paginatedResponse = await client.transactionsGet(paginatedRequest);
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }

    return await Promise.all(transactions.map(createTransaction));
  }

  // WARNING:
  // You probably want `refreshPlaidItems` instead!!
  @Query(() => [InvestmentTransaction])
  async fetchInvestmentTransactions(@Arg('itemId') itemId: string) {
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
      const paginatedResponse = await client.investmentsTransactionsGet(
        paginatedRequest,
      );
      investment_transactions = investment_transactions.concat(
        paginatedResponse.data.investment_transactions,
      );
    }

    const allItems = await Promise.all([
      ...response.data.investment_transactions.map(
        createOrUpdateInvestmentTransaction,
      ),
      ...response.data.securities.map(createOrUpdateSecurity),
    ]);

    return allItems.filter((item) => item instanceof InvestmentTransaction);
  }

  @Query(() => [InvestmentHolding])
  async fetchInvestmentHoldings(@Arg('itemId') itemId: string) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.investmentsHoldingsGet({
      access_token: item.accessToken,
    });

    const allItems = await Promise.all([
      ...response.data.holdings.map(createInvestmentHolding),
      ...response.data.securities.map(createOrUpdateSecurity),
    ]);

    return allItems.filter((item) => item instanceof InvestmentHolding);
  }

  @Query(() => Institution)
  async getInstitution(@Arg('institutionId') institutionId: string) {
    try {
      let institution = await Institution.findOne(institutionId);

      if (institution) {
        return institution;
      }

      const response = await client.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
        options: {
          include_optional_metadata: true,
        },
      });

      if (response.data != null) {
        return await createInstitution(response.data.institution);
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  @Query(() => [Institution])
  async getAllInstitutions() {
    return await Institution.find();
  }

  @Query(() => [PlaidItem])
  async getItems() {
    return await PlaidItem.find();
  }

  @Query(() => [TransactionCategory])
  async transactionDetails(
    @Arg('accountId', { nullable: true }) accountId: string,
  ): Promise<Array<TransactionCategory>> {
    const options = {
      where: {},
    } as FindManyOptions<Transaction>;

    if (accountId != null) {
      options.where = { accountId };
    }

    const transactions = await Transaction.find(options);
    const reduced = transactions.reduce((acc, trans: Transaction) => {
      if (acc[trans.description]) {
        acc[trans.description].count++;
        acc[trans.description].value += trans.amountCents;
      } else {
        acc[trans.description] = {
          count: 1,
          value: trans.amountCents,
        };
      }
      return { ...acc };
    }, {} as { [key: string]: { count: number; value: number } });
    const results = [] as TransactionCategory[];

    Object.keys(reduced).forEach((key) => {
      results.push({
        category: key,
        count: reduced[key].count,
        value: reduced[key].value,
      });
    });

    return results.sort((a, b) => a.value - b.value);
  }
}

@ObjectType()
export class TransactionCategory {
  @Field(() => String)
  category: string;

  @Field(() => Number)
  count: number;

  @Field(() => Number)
  value: number;
}
