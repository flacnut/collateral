/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountCreateInput } from "./../graphql-global-types";

// ====================================================
// GraphQL mutation operation: createAccount
// ====================================================

export interface createAccount_createAccount {
  __typename: "Account";
  id: number;
  currency: string;
  accountName: string;
  accountNumber: string;
  institution: string;
}

export interface createAccount {
  createAccount: createAccount_createAccount;
}

export interface createAccountVariables {
  options: AccountCreateInput;
}
