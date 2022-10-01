import { gql } from "@apollo/client";

// npx apollo schema:download --endpoint=http://localhost:4000/graphql src/graphql/graphql-schema.json
// npx apollo codegen:generate --localSchemaFile=src/graphql/graphql-schema.json --target=typescript --includes=src/graphql/queries.ts --tagName=gql --addTypename --globalTypesFile=src/graphql/graphql-global-types.ts types

const queries = {
  GET_LINK_TOKEN: gql`
    query getToken {
      getLinkToken {
        token
        error
      }
    }
  `,

  SET_PLAID_LINK_RESPONSE: gql`
    mutation setPlaidLinkResponse($plaidLinkResponse: PlaidLinkResponse!) {
      setPlaidLinkResponse(plaidLinkResponse: $plaidLinkResponse) {
        id 
        institutionId
      }
    }
  `,

  GET_PLAID_INSTITUTION: gql`
    query getInstitution($plaidInstitutionId: String!) {
      getInstitution(institutionId: $plaidInstitutionId) {
        id
        url
        logo
        products
        primaryColor
        name
        countryCodes
      }
    }`
};

export default queries;