/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { KnownBalance } from "./../graphql-global-types";

// ====================================================
// GraphQL mutation operation: generateBalancesForAccount
// ====================================================

export interface generateBalancesForAccount_generateBalancesForAccount {
  __typename: "Account";
  id: number;
}

export interface generateBalancesForAccount {
  generateBalancesForAccount: generateBalancesForAccount_generateBalancesForAccount;
}

export interface generateBalancesForAccountVariables {
  accountId: number;
  knownBalance: KnownBalance;
}
