import {
  Arg,
  createUnionType,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode,
  Products,
  TransactionsGetRequest,
  InvestmentsTransactionsGetRequest,
  Holding,
} from "plaid";
import { client_id, dev_secret } from "../../plaidConfig.json";
import {
  CoreTransaction,
  Transaction,
  PlaidItem,
  Institution,
  InvestmentHolding,
  InvestmentTransaction,
  Account,
} from "@entities";
import {
  createAccount,
  createInvestmentTransaction,
  createInstitution,
  createInvestmentHolding,
  createItem,
  createOrUpdateSecurity,
  createTransaction,
} from "../../src/utils/PlaidEntityHelper";
import {
  DateAmountAccountTuple,
  MatchTransfers,
} from "../../src/utils/AccountUtils";
import { Transfer } from "@entities";
import { UnsavedTransfer } from "../../src/entity/Transfer";
import { FindManyOptions } from "typeorm";
import PlaidFetcherUtil from "../../src/utils/PlaidFetcherUtil";

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

const AnyTransaction = createUnionType({
  name: "AnyTransaction",
  types: () => [Transaction, InvestmentTransaction] as const,
});

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
        //access_token: "<item access token>",
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
    @Arg("plaidLinkResponse", () => PlaidLinkResponse)
    linkResponse: PlaidLinkResponse
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
          linkResponse.institutionId
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
          })
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
  async fetchAccounts(@Arg("itemId") itemId: string) {
    const item = await PlaidItem.findOneOrFail(itemId);

    if (item != null) {
      const response = await client.accountsGet({
        access_token: item.accessToken,
      });

      if (response.data != null) {
        return await Promise.all(
          response.data.accounts.map(async (acc) => createAccount(item, acc))
        );
      }
    }
    return [];
  }

  @Query(() => [Transaction])
  async fetchTransactions(@Arg("itemId") itemId: string) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.transactionsGet({
      access_token: item.accessToken,
      start_date: "2022-01-01",
      end_date: "2022-12-31",
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
        start_date: "2022-01-01",
        end_date: "2022-12-31",
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

  @Query(() => [InvestmentHolding])
  async fetchInvestmentHoldings(@Arg("itemId") itemId: string) {
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

  @Query(() => [InvestmentTransaction])
  async fetchInvestmentTransactions(@Arg("itemId") itemId: string) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.investmentsTransactionsGet({
      access_token: item.accessToken,
      start_date: "2022-01-01",
      end_date: "2022-12-31",
    });

    let investment_transactions = response.data.investment_transactions;
    const total_transactions = response.data.total_investment_transactions;

    while (investment_transactions.length < total_transactions) {
      const paginatedRequest: InvestmentsTransactionsGetRequest = {
        access_token: item.accessToken,
        start_date: "2022-01-01",
        end_date: "2022-12-31",
        options: {
          offset: investment_transactions.length,
        },
      };
      const paginatedResponse = await client.investmentsTransactionsGet(
        paginatedRequest
      );
      investment_transactions = investment_transactions.concat(
        paginatedResponse.data.investment_transactions
      );
    }

    const allItems = await Promise.all([
      ...response.data.investment_transactions.map(createInvestmentTransaction),
      ...response.data.securities.map(createOrUpdateSecurity),
    ]);

    return allItems.filter((item) => item instanceof InvestmentTransaction);
  }

  @Query(() => [InvestmentHolding])
  async fetchHoldings(@Arg("itemId") itemId: string) {
    const item = await PlaidItem.findOneOrFail(itemId);

    const response = await client.investmentsHoldingsGet({
      access_token: item.accessToken,
    });

    console.dir(response.data);

    await Promise.all(
      response.data.holdings.map(async (holding: Holding) => {
        let h = new InvestmentHolding();
        h.accountId = holding.account_id;
        h.securityId = holding.security_id;
        h.costBasisCents = Number(holding.cost_basis) * 100;
        h.quantity = holding.quantity;
        h.currency = holding.iso_currency_code;
        h.institutionPriceCents = holding.institution_price * 100;
        h.institutionValueCents = holding.institution_value * 100;
        h.institutionPriceAsOfDate = holding.institution_price_datetime
          ? new Date().toLocaleDateString(holding.institution_price_datetime)
          : null;
        await h.save();
      })
    );

    await Promise.all(response.data.securities.map(createOrUpdateSecurity));

    return await InvestmentHolding.find();
  }

  @Query(() => Institution)
  async getInstitution(@Arg("institutionId") institutionId: string) {
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

  @Query(() => [Transfer])
  async getPossibleTransfers() {
    const transactions = await CoreTransaction.find();

    const rawTransfers = MatchTransfers(
      transactions.map((t) => {
        return {
          date: new Date(t.date),
          amountCents: t.amountCents,
          accountId: t.accountId,
          transactionId: t.id,
        } as DateAmountAccountTuple;
      })
    );

    let transfers = rawTransfers.map((transfer) => {
      let to = transactions.filter((t) => t.id === transfer.to)[0];
      let from = transactions.filter((t) => t.id === transfer.from)[0];

      return {
        from,
        to,
        date: from.date,
        amountCents: transfer.amountCents,
      } as Transfer;
    });

    return transfers;
  }

  @Mutation(() => [Transfer])
  async saveTransfers(
    @Arg("transfers", () => [UnsavedTransfer]) transfers: UnsavedTransfer[]
  ) {
    let transactionIds = transfers
      .map((transfer) => {
        return [transfer.toId, transfer.fromId];
      })
      .flat();
    let transactions = await CoreTransaction.findByIds(transactionIds);

    if (transactions.length !== 2 * transfers.length) {
      console.error("Should be unreachable.");
    }

    let transferWrites = transfers
      .map((_transfer) => {
        let from = transactions.find((t) => t.id === _transfer.fromId);
        let to = transactions.find((t) => t.id === _transfer.toId);
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
      })
      .filter((t) => t != null) as Transfer[];

    await Transfer.getRepository().save(transferWrites);
    return transferWrites;
  }

  @Query(() => [PlaidItem])
  async getItems() {
    return await PlaidItem.find();
  }

  @Query(() => [Account])
  async getAccounts(
    @Arg("accountIds", () => [String], { nullable: true }) accountIds: string[]
  ) {
    if (accountIds && accountIds.length > 0) {
      return await Account.findByIds(accountIds);
    }

    return await Account.find();
  }

  @Mutation(() => Boolean)
  async deleteAccount(@Arg("accountId", () => String) accountId: string) {
    const account = await Account.findOne({ id: accountId });
    if (account) {
      const accountsForItem = await Account.find({
        itemId: account.itemId,
      });

      await CoreTransaction.delete({ accountId: accountId });
      await Account.delete({ id: accountId });

      if (accountsForItem.length === 1) {
        await PlaidItem.delete({ id: account.itemId });
      }
    }

    return true;
  }

  @Query(() => [AnyTransaction])
  async getTransactions(
    @Arg("accountId", { nullable: true }) accountId: string,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 100 })
    limit: number,
    @Arg("after", () => Int, { nullable: true, defaultValue: 0 }) after: number
  ) {
    const options = {
      where: {},
      order: { date: "DESC" },
      skip: after,
      //take: limit,
    } as FindManyOptions<CoreTransaction>;

    console.dir(limit);

    if (accountId != null) {
      options.where = { accountId };
    }

    return await CoreTransaction.find(options);
  }

  @Query(() => [InvestmentTransaction])
  async getHoldingTransactions(
    @Arg("accountId", { nullable: true }) accountId: string,
    @Arg("limit", { nullable: true, defaultValue: 100 }) limit: number,
    @Arg("after", { nullable: true, defaultValue: 0 }) after: number
  ) {
    const options = {
      where: {},
      order: { date: "DESC" },
      skip: after,
      take: limit,
    } as FindManyOptions<CoreTransaction>;

    if (accountId != null) {
      options.where = { accountId };
    }

    return await InvestmentTransaction.find(options);
  }

  @Query(() => [TransactionCategory])
  async transactionDetails(
    @Arg("accountId", { nullable: true }) accountId: string
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
