/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TransactionBulkCreateInput } from "./../graphql-global-types";

// ====================================================
// GraphQL mutation operation: createTransactions
// ====================================================

export interface createTransactions {
  createTransactions: boolean;
}

export interface createTransactionsVariables {
  transactions: TransactionBulkCreateInput[];
  sourceId: number;
  accountId: number;
}
