import { Arg, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode,
  Products,
} from "plaid";
import { client_id, dev_secret } from "../../plaidConfig.json";
import { Item } from "../../src/entity/plaid/Item";
import { Institution } from "../../src/entity/plaid/Institution";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
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

  @Mutation(() => Item)
  async setPlaidLinkResponse(
    @Arg("plaidLinkResponse", () => PlaidLinkResponse) linkResponse: PlaidLinkResponse
  ) {
    try {
      const response = await client.itemPublicTokenExchange({
        public_token: linkResponse.publicToken,
      });

      if (response.data != null) {
        const item = new Item();
        item.id = response.data.item_id;
        item.accessToken = response.data.access_token;
        item.institutionId = linkResponse.institutionId;
        await item.save();
        return item;
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  @Query(() => Institution)
  async getInstitution(
    @Arg("institutionId") institutionId: string
  ) {
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
        }
      });

      if (response.data != null) {
        console.dir(response.data);
        institution = new Institution();
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
