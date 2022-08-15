import { Query, Resolver } from "type-graphql";
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products, DepositoryAccountSubtype } from "plaid";
import { client_id, dev_secret } from "../../plaidConfig.json";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': client_id,
      'PLAID-SECRET': dev_secret,
    },
  },
});

const client = new PlaidApi(configuration);

@Resolver()
export class PlaidResolver {

  @Query(() => String)
  async getLinkToken() {

    return client.linkTokenCreate({
      user: {
        client_user_id: '4325',
      },
      client_name: 'Plaid Test App',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: 'https://sample-web-hook.com',
      redirect_uri: 'https://localhost:3000/oauth',
      account_filters: {
        depository: {
          account_subtypes: [DepositoryAccountSubtype.Checking, DepositoryAccountSubtype.Savings],
        },
      },
    })
      .then(response => {
        console.dir(response);
        return response.data.link_token
      })
      .catch(error => { console.error(error); return error.toString(); });
  }
}
