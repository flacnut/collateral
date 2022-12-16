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
    "\nquery getItems {\n  getItems {\n    id\n    accounts {\n      ...AccountParts\n      latestBalance {\n        ...BalanceParts\n      }\n      latestTransaction {\n        date\n      }\n      institution {\n        ...InstitutionParts\n      }\n    }\n  }\n}\n\nfragment AccountParts on PlaidAccount {\n  id\n  name\n  mask\n  type\n  subtype\n  officialName\n  status\n  currency\n  totalTransactions\n}\n\nfragment BalanceParts on PlaidAccountBalance {\n  balanceCents\n  limitCents\n  lastUpdateDate\n  availableCents\n}\n\nfragment InstitutionParts on PlaidInstitution {\n  id\n  url\n  name\n  logo\n  products\n  countryCodes\n  primaryColor\n}\n": types.GetItemsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery getItems {\n  getItems {\n    id\n    accounts {\n      ...AccountParts\n      latestBalance {\n        ...BalanceParts\n      }\n      latestTransaction {\n        date\n      }\n      institution {\n        ...InstitutionParts\n      }\n    }\n  }\n}\n\nfragment AccountParts on PlaidAccount {\n  id\n  name\n  mask\n  type\n  subtype\n  officialName\n  status\n  currency\n  totalTransactions\n}\n\nfragment BalanceParts on PlaidAccountBalance {\n  balanceCents\n  limitCents\n  lastUpdateDate\n  availableCents\n}\n\nfragment InstitutionParts on PlaidInstitution {\n  id\n  url\n  name\n  logo\n  products\n  countryCodes\n  primaryColor\n}\n"): (typeof documents)["\nquery getItems {\n  getItems {\n    id\n    accounts {\n      ...AccountParts\n      latestBalance {\n        ...BalanceParts\n      }\n      latestTransaction {\n        date\n      }\n      institution {\n        ...InstitutionParts\n      }\n    }\n  }\n}\n\nfragment AccountParts on PlaidAccount {\n  id\n  name\n  mask\n  type\n  subtype\n  officialName\n  status\n  currency\n  totalTransactions\n}\n\nfragment BalanceParts on PlaidAccountBalance {\n  balanceCents\n  limitCents\n  lastUpdateDate\n  availableCents\n}\n\nfragment InstitutionParts on PlaidInstitution {\n  id\n  url\n  name\n  logo\n  products\n  countryCodes\n  primaryColor\n}\n"];

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