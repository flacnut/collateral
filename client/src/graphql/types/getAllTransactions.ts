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

export interface getAllTransactions_transactions_account {
  __typename: "Account";
  id: number;
}

export interface getAllTransactions_transactions {
  __typename: "Transaction";
  id: number;
  date: string;
  amountCents: number;
  originalDescription: string;
  friendlyDescription: string | null;
  tags: getAllTransactions_transactions_tags[];
  account: getAllTransactions_transactions_account;
}

export interface getAllTransactions {
  transactions: getAllTransactions_transactions[];
}
