/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RichQuery } from "./../graphql-global-types";

// ====================================================
// GraphQL query operation: getFilteredTransactions
// ====================================================

export interface getFilteredTransactions_getFilteredTransactions_tags {
  __typename: "Tag";
  id: number;
  tag: string;
}

export interface getFilteredTransactions_getFilteredTransactions {
  __typename: "Transaction";
  id: number;
  date: string;
  amountCents: number;
  originalDescription: string;
  friendlyDescription: string | null;
  tags: getFilteredTransactions_getFilteredTransactions_tags[];
}

export interface getFilteredTransactions {
  getFilteredTransactions: getFilteredTransactions_getFilteredTransactions[];
}

export interface getFilteredTransactionsVariables {
  options: RichQuery;
}
