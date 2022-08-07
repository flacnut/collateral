/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getAllAccounts
// ====================================================

export interface getAllAccounts_allAccounts_latestBalance {
  __typename: "AccountBalance";
  id: number;
  balanceCents: number;
  date: string;
}

export interface getAllAccounts_allAccounts_latestTransaction {
  __typename: "Transaction";
  id: number;
  date: string;
}

export interface getAllAccounts_allAccounts {
  __typename: "AccountWithState";
  id: number;
  accountName: string;
  accountNumber: string;
  institution: string;
  knownBalanceDate: any | null;
  knownBalanceAmountCents: number | null;
  latestBalance: getAllAccounts_allAccounts_latestBalance | null;
  latestTransaction: getAllAccounts_allAccounts_latestTransaction | null;
}

export interface getAllAccounts {
  allAccounts: getAllAccounts_allAccounts[];
}
