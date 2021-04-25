/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: generateTransfers
// ====================================================

export interface generateTransfers_generateTransfers_from_account {
  __typename: "Account";
  id: number;
  accountName: string;
  institution: string;
  accountNumber: string;
}

export interface generateTransfers_generateTransfers_from {
  __typename: "Transaction";
  id: number;
  date: string;
  amountCents: number;
  account: generateTransfers_generateTransfers_from_account;
}

export interface generateTransfers_generateTransfers_to_account {
  __typename: "Account";
  id: number;
  accountName: string;
  institution: string;
  accountNumber: string;
}

export interface generateTransfers_generateTransfers_to {
  __typename: "Transaction";
  id: number;
  date: string;
  amountCents: number;
  account: generateTransfers_generateTransfers_to_account;
}

export interface generateTransfers_generateTransfers {
  __typename: "Transfer";
  from: generateTransfers_generateTransfers_from;
  to: generateTransfers_generateTransfers_to;
}

export interface generateTransfers {
  generateTransfers: generateTransfers_generateTransfers[];
}

export interface generateTransfersVariables {
  accountIds: number[];
}
