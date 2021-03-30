import { gql } from "@apollo/client";

// npx apollo schema:download --endpoint=http://localhost:4000/graphql src/graphql/graphql-schema.json
// npx apollo codegen:generate --localSchemaFile=src/graphql/graphql-schema.json --target=typescript --includes=src/graphql/Queries.ts --tagName=gql --addTypename --globalTypesFile=src/graphql/graphql-global-types.ts types

const queries = {
  GET_ALL_TRANSACTIONS: gql`
    query getAllTransactions {
      transactions {
        id
        date
        amountCents
        originalDescription
        friendlyDescription
        tags {
          id
          tag
        }
      }
    }
  `,

  GET_TRANSACTIONS_ONLY_BY_TAG: gql`
    query getTransactionsByTags($tags: [String!]!) {
      transactionsByTags(tags: $tags) {
        id
        date
        amountCents
        originalDescription
        friendlyDescription
      }
    }
  `,

  GET_ALL_TAGS: gql`
    query getAllTags {
      tags {
        id
        tag
      }
    }
  `,

  CREATE_TAG: gql`
    mutation createSingleTag($tag: String!) {
      createTag(options: { tag: $tag }) {
        id
        tag
      }
    }
  `,

  UPDATE_TRANSACTION_TAGS: gql`
    mutation updateTransactionTags($options: [TransactionUpdateTagsInput!]!) {
      updateTransactionTags(options: $options)
    }
  `,
};

export default queries;
