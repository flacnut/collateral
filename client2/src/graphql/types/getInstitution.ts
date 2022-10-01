/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getInstitution
// ====================================================

export interface getInstitution_getInstitution {
  __typename: "Institution";
  id: string;
  url: string | null;
  logo: string | null;
  products: string;
  primaryColor: string | null;
  name: string;
  countryCodes: string;
}

export interface getInstitution {
  getInstitution: getInstitution_getInstitution;
}

export interface getInstitutionVariables {
  plaidInstitutionId: string;
}
