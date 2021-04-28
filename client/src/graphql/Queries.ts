import { gql } from "@apollo/client";

// npx apollo schema:download --endpoint=http://localhost:4000/graphql src/graphql/graphql-schema.json
// npx apollo codegen:generate --localSchemaFile=src/graphql/graphql-schema.json --target=typescript --includes=src/graphql/Queries.ts --tagName=gql --addTypename --globalTypesFile=src/graphql/graphql-global-types.ts types

const queries = {
  CREATE_TRANSACTION: gql`
    mutation createTransaction($options: TransactionCreateInput!) {
      createTransaction(options: $options) {
        id
        date
        amountCents
        originalDescription
      }
    }
  `,

  CREATE_TRANSACTIONS: gql`
    mutation createTransactions(
      $transactions: [TransactionBulkCreateInput!]!
      $sourceId: Float!
      $accountId: Float!
    ) {
      createTransactions(
        transactions: $transactions
        sourceId: $sourceId
        accountId: $accountId
      )
    }
  `,

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
        account {
          id
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

  CREATE_TAG_RULE: gql`
    mutation createTagRule($options: TagRuleCreateInput!) {
      createTagRule(options: $options) {
        id
        name
        minimumAmount
        maximumAmount
        descriptionContains
        tagsToAdd {
          id
          tag
        }
        thisTag {
          id
          tag
        }
        forAccounts {
          id
          institution
          accountName
          accountNumber
        }
      }
    }
  `,

  UPDATE_TRANSACTION_TAGS: gql`
    mutation updateTransactionTags($options: [TransactionUpdateTagsInput!]!) {
      updateTransactionTags(options: $options)
    }
  `,

  CREATE_ACCOUNT: gql`
    mutation createAccount($options: AccountCreateInput!) {
      createAccount(options: $options) {
        id
        currency
        accountName
        accountNumber
        institution
      }
    }
  `,

  GENERATE_TRANSFERS: gql`
    mutation generateTransfers($accountIds: [Int!]!) {
      generateTransfers(accountIds: $accountIds) {
        from {
          id
          date
          amountCents
          account {
            id
            accountName
            institution
            accountNumber
          }
        }
        to {
          id
          date
          amountCents
          account {
            id
            accountName
            institution
            accountNumber
          }
        }
      }
    }
  `,

  GET_ALL_ACCOUNTS: gql`
    query getAllAccounts {
      allAccounts {
        id
        accountName
        accountNumber
        institution
        latestBalance {
          id
          balanceCents
          date
        }
        latestTransaction {
          id
          date
        }
      }
    }
  `,

  CREATE_SOURCE: gql`
    mutation createSource($name: String!) {
      createSource(name: $name) {
        id
        fileName
      }
    }
  `,

  GET_ALL_SOURCES: gql`
    query getAllSources {
      allSources {
        id
        fileName
        importDate
      }
    }
  `,
};

export default queries;
