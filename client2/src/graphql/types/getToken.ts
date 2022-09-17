/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getToken
// ====================================================

export interface getToken_getLinkToken {
  __typename: "LinkTokenResult";
  token: string | null;
  error: string | null;
}

export interface getToken {
  getLinkToken: getToken_getLinkToken;
}
