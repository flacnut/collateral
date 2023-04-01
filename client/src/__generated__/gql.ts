/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "\nquery getItems {\n  getItems {\n    id\n    accounts {\n      ...AccountParts\n      latestBalance {\n        ...BalanceParts\n      }\n      latestTransaction {\n        date\n      }\n      institution {\n        ...InstitutionParts\n      }\n    }\n  }\n}\n\nfragment AccountParts on Account {\n  id\n  name\n  mask\n  type\n  subtype\n  officialName\n  status\n  currency\n  totalTransactions\n}\n\nfragment BalanceParts on AccountBalance {\n  balanceCents\n  limitCents\n  lastUpdateDate\n  availableCents\n}\n\nfragment InstitutionParts on Institution {\n  id\n  url\n  name\n  logo\n  products\n  countryCodes\n  primaryColor\n}\n": types.GetItemsDocument,
    "\nquery getToken {\n  getLinkToken {\n    token\n    error\n  }\n}\n": types.GetTokenDocument,
    "\nmutation setPlaidLinkResponse($plaidLinkResponse: PlaidLinkResponse!) {\n  setPlaidLinkResponse(plaidLinkResponse: $plaidLinkResponse) {\n    id \n    institutionId\n  }\n}\n": types.SetPlaidLinkResponseDocument,
    "\nmutation deletAccount($accountId: String!) {\n  deleteAccount(accountId: $accountId) \n}": types.DeletAccountDocument,
    "\nquery getTransactionQuery($transactionId: String!) {\n  getTransaction(id: $transactionId) {\n    __typename\n  \t...on Transaction {\n      ...CoreTransactionParts\n      ...ExtraTransactionParts\n      account {\n        id\n        name\n      }\n    }\n    ...on BackfilledTransaction {\n      ...CoreBackfilledTransactionParts\n      account {\n        id\n        name\n      }\n    }\n    ... on InvestmentTransaction {\n      ...CoreInvestmentTransactionParts\n      ...ExtraInvestmentTransactionParts\n      account {\n        id\n        name\n      }\n    }\n  }\n}\n\nfragment CoreTransactionParts on Transaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreBackfilledTransactionParts on BackfilledTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreInvestmentTransactionParts on InvestmentTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment ExtraTransactionParts on Transaction {\n  category\n  categoryId\n  dateTime\n  authorizedDate\n  authorizedDateTime\n  locationJson\n  paymentMetaJson\n  originalDescription\n  merchant\n  paymentChannel\n  transactionCode\n  pending\n}\n\nfragment ExtraInvestmentTransactionParts on InvestmentTransaction {\n  securityId\n  feesCents\n  unitPriceCents\n  quantity\n  type\n  subType\n  \n  security {\n    id\n    name\n    isin\n    ticker\n  }\n}": types.GetTransactionQueryDocument,
    "query getTags {\n  tags {\n    name\n  }\n}": types.GetTagsDocument,
    "query getAccounts {\n  getAccounts {\n    id\n    name\n  }\n}": types.GetAccountsDocument,
    "\nquery getBasicTransactions($accountId: String, $limit: Int, $offset: Int) {\n  getTransactions(accountId: $accountId, limit: $limit, after: $offset) {\n    __typename\n    ...on Transaction {\n      ...CoreTransactionParts\n      account {\n        id\n        name\n      }\n      tags {\n        name\n      }\n    }\n    ...on BackfilledTransaction {\n      ...CoreBackfilledTransactionParts\n      account {\n        id\n        name\n      }\n      tags {\n        name\n      }\n    }\n    ... on InvestmentTransaction {\n      ...CoreInvestmentTransactionParts\n      account {\n        id\n        name\n      }\n      tags {\n        name\n      }\n    }\n  }\n}\n\nfragment CoreTransactionParts on Transaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreBackfilledTransactionParts on BackfilledTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreInvestmentTransactionParts on InvestmentTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}": types.GetBasicTransactionsDocument,
    "\nquery getPossibleTransfers {\n  getPossibleTransfers {\n    date\n    amountCents\n    to {\n  \t\t...parts\n      account {\n        id\n        name\n        mask\n        institution {\n          id\n          name\n          logo\n          primaryColor\n        }\n      }\n  \t}\n    from {\n      ...parts\n      account {\n        id\n        name\n        mask\n        institution {\n          id\n          name\n          logo\n          primaryColor\n        }\n      }\n\t\t}\n  }\n}\n\nfragment parts on CoreTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}": types.GetPossibleTransfersDocument,
    "\nmutation saveTransfers($transfers: [UnsavedTransfer!]!) {\n  saveTransfers(transfers:$transfers) {\n    to {\n      ...parts\n    }\n    from {\n      ...parts\n    }\n  }\n}": types.SaveTransfersDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery getItems {\n  getItems {\n    id\n    accounts {\n      ...AccountParts\n      latestBalance {\n        ...BalanceParts\n      }\n      latestTransaction {\n        date\n      }\n      institution {\n        ...InstitutionParts\n      }\n    }\n  }\n}\n\nfragment AccountParts on Account {\n  id\n  name\n  mask\n  type\n  subtype\n  officialName\n  status\n  currency\n  totalTransactions\n}\n\nfragment BalanceParts on AccountBalance {\n  balanceCents\n  limitCents\n  lastUpdateDate\n  availableCents\n}\n\nfragment InstitutionParts on Institution {\n  id\n  url\n  name\n  logo\n  products\n  countryCodes\n  primaryColor\n}\n"): (typeof documents)["\nquery getItems {\n  getItems {\n    id\n    accounts {\n      ...AccountParts\n      latestBalance {\n        ...BalanceParts\n      }\n      latestTransaction {\n        date\n      }\n      institution {\n        ...InstitutionParts\n      }\n    }\n  }\n}\n\nfragment AccountParts on Account {\n  id\n  name\n  mask\n  type\n  subtype\n  officialName\n  status\n  currency\n  totalTransactions\n}\n\nfragment BalanceParts on AccountBalance {\n  balanceCents\n  limitCents\n  lastUpdateDate\n  availableCents\n}\n\nfragment InstitutionParts on Institution {\n  id\n  url\n  name\n  logo\n  products\n  countryCodes\n  primaryColor\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery getToken {\n  getLinkToken {\n    token\n    error\n  }\n}\n"): (typeof documents)["\nquery getToken {\n  getLinkToken {\n    token\n    error\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation setPlaidLinkResponse($plaidLinkResponse: PlaidLinkResponse!) {\n  setPlaidLinkResponse(plaidLinkResponse: $plaidLinkResponse) {\n    id \n    institutionId\n  }\n}\n"): (typeof documents)["\nmutation setPlaidLinkResponse($plaidLinkResponse: PlaidLinkResponse!) {\n  setPlaidLinkResponse(plaidLinkResponse: $plaidLinkResponse) {\n    id \n    institutionId\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation deletAccount($accountId: String!) {\n  deleteAccount(accountId: $accountId) \n}"): (typeof documents)["\nmutation deletAccount($accountId: String!) {\n  deleteAccount(accountId: $accountId) \n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery getTransactionQuery($transactionId: String!) {\n  getTransaction(id: $transactionId) {\n    __typename\n  \t...on Transaction {\n      ...CoreTransactionParts\n      ...ExtraTransactionParts\n      account {\n        id\n        name\n      }\n    }\n    ...on BackfilledTransaction {\n      ...CoreBackfilledTransactionParts\n      account {\n        id\n        name\n      }\n    }\n    ... on InvestmentTransaction {\n      ...CoreInvestmentTransactionParts\n      ...ExtraInvestmentTransactionParts\n      account {\n        id\n        name\n      }\n    }\n  }\n}\n\nfragment CoreTransactionParts on Transaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreBackfilledTransactionParts on BackfilledTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreInvestmentTransactionParts on InvestmentTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment ExtraTransactionParts on Transaction {\n  category\n  categoryId\n  dateTime\n  authorizedDate\n  authorizedDateTime\n  locationJson\n  paymentMetaJson\n  originalDescription\n  merchant\n  paymentChannel\n  transactionCode\n  pending\n}\n\nfragment ExtraInvestmentTransactionParts on InvestmentTransaction {\n  securityId\n  feesCents\n  unitPriceCents\n  quantity\n  type\n  subType\n  \n  security {\n    id\n    name\n    isin\n    ticker\n  }\n}"): (typeof documents)["\nquery getTransactionQuery($transactionId: String!) {\n  getTransaction(id: $transactionId) {\n    __typename\n  \t...on Transaction {\n      ...CoreTransactionParts\n      ...ExtraTransactionParts\n      account {\n        id\n        name\n      }\n    }\n    ...on BackfilledTransaction {\n      ...CoreBackfilledTransactionParts\n      account {\n        id\n        name\n      }\n    }\n    ... on InvestmentTransaction {\n      ...CoreInvestmentTransactionParts\n      ...ExtraInvestmentTransactionParts\n      account {\n        id\n        name\n      }\n    }\n  }\n}\n\nfragment CoreTransactionParts on Transaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreBackfilledTransactionParts on BackfilledTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreInvestmentTransactionParts on InvestmentTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment ExtraTransactionParts on Transaction {\n  category\n  categoryId\n  dateTime\n  authorizedDate\n  authorizedDateTime\n  locationJson\n  paymentMetaJson\n  originalDescription\n  merchant\n  paymentChannel\n  transactionCode\n  pending\n}\n\nfragment ExtraInvestmentTransactionParts on InvestmentTransaction {\n  securityId\n  feesCents\n  unitPriceCents\n  quantity\n  type\n  subType\n  \n  security {\n    id\n    name\n    isin\n    ticker\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query getTags {\n  tags {\n    name\n  }\n}"): (typeof documents)["query getTags {\n  tags {\n    name\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query getAccounts {\n  getAccounts {\n    id\n    name\n  }\n}"): (typeof documents)["query getAccounts {\n  getAccounts {\n    id\n    name\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery getBasicTransactions($accountId: String, $limit: Int, $offset: Int) {\n  getTransactions(accountId: $accountId, limit: $limit, after: $offset) {\n    __typename\n    ...on Transaction {\n      ...CoreTransactionParts\n      account {\n        id\n        name\n      }\n      tags {\n        name\n      }\n    }\n    ...on BackfilledTransaction {\n      ...CoreBackfilledTransactionParts\n      account {\n        id\n        name\n      }\n      tags {\n        name\n      }\n    }\n    ... on InvestmentTransaction {\n      ...CoreInvestmentTransactionParts\n      account {\n        id\n        name\n      }\n      tags {\n        name\n      }\n    }\n  }\n}\n\nfragment CoreTransactionParts on Transaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreBackfilledTransactionParts on BackfilledTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreInvestmentTransactionParts on InvestmentTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}"): (typeof documents)["\nquery getBasicTransactions($accountId: String, $limit: Int, $offset: Int) {\n  getTransactions(accountId: $accountId, limit: $limit, after: $offset) {\n    __typename\n    ...on Transaction {\n      ...CoreTransactionParts\n      account {\n        id\n        name\n      }\n      tags {\n        name\n      }\n    }\n    ...on BackfilledTransaction {\n      ...CoreBackfilledTransactionParts\n      account {\n        id\n        name\n      }\n      tags {\n        name\n      }\n    }\n    ... on InvestmentTransaction {\n      ...CoreInvestmentTransactionParts\n      account {\n        id\n        name\n      }\n      tags {\n        name\n      }\n    }\n  }\n}\n\nfragment CoreTransactionParts on Transaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreBackfilledTransactionParts on BackfilledTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}\n\nfragment CoreInvestmentTransactionParts on InvestmentTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery getPossibleTransfers {\n  getPossibleTransfers {\n    date\n    amountCents\n    to {\n  \t\t...parts\n      account {\n        id\n        name\n        mask\n        institution {\n          id\n          name\n          logo\n          primaryColor\n        }\n      }\n  \t}\n    from {\n      ...parts\n      account {\n        id\n        name\n        mask\n        institution {\n          id\n          name\n          logo\n          primaryColor\n        }\n      }\n\t\t}\n  }\n}\n\nfragment parts on CoreTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}"): (typeof documents)["\nquery getPossibleTransfers {\n  getPossibleTransfers {\n    date\n    amountCents\n    to {\n  \t\t...parts\n      account {\n        id\n        name\n        mask\n        institution {\n          id\n          name\n          logo\n          primaryColor\n        }\n      }\n  \t}\n    from {\n      ...parts\n      account {\n        id\n        name\n        mask\n        institution {\n          id\n          name\n          logo\n          primaryColor\n        }\n      }\n\t\t}\n  }\n}\n\nfragment parts on CoreTransaction {\n  id\n  accountId\n  description\n  amountCents\n  amount\n  date\n  currency\n  classification\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation saveTransfers($transfers: [UnsavedTransfer!]!) {\n  saveTransfers(transfers:$transfers) {\n    to {\n      ...parts\n    }\n    from {\n      ...parts\n    }\n  }\n}"): (typeof documents)["\nmutation saveTransfers($transfers: [UnsavedTransfer!]!) {\n  saveTransfers(transfers:$transfers) {\n    to {\n      ...parts\n    }\n    from {\n      ...parts\n    }\n  }\n}"];

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
**/
export function gql(source: string): unknown;

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;