/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getTransactionsByTags
// ====================================================

export interface getTransactionsByTags_transactionsByTags {
  __typename: "Transaction";
  id: number;
  date: string;
  amountCents: number;
  originalDescription: string;
  friendlyDescription: string;
}

export interface getTransactionsByTags {
  transactionsByTags: getTransactionsByTags_transactionsByTags[];
}

export interface getTransactionsByTagsVariables {
  tags: string[];
}
