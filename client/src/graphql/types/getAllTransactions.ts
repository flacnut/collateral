/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getAllTransactions
// ====================================================

export interface getAllTransactions_transactions_tags {
  __typename: "Tag";
  id: number;
  tag: string;
}

export interface getAllTransactions_transactions {
  __typename: "Transaction";
  id: number;
  date: string;
  amountCents: number;
  originalDescription: string;
  friendlyDescription: string;
  tags: getAllTransactions_transactions_tags[];
}

export interface getAllTransactions {
  transactions: getAllTransactions_transactions[];
}
