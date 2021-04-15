/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TransactionCreateInput } from "./../graphql-global-types";

// ====================================================
// GraphQL mutation operation: createTransaction
// ====================================================

export interface createTransaction_createTransaction {
  __typename: "Transaction";
  id: number;
  date: string;
  amountCents: number;
  originalDescription: string;
}

export interface createTransaction {
  createTransaction: createTransaction_createTransaction;
}

export interface createTransactionVariables {
  options: TransactionCreateInput;
}
