/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getAllSources
// ====================================================

export interface getAllSources_allSources {
  __typename: "Source";
  id: number;
  fileName: string;
  importDate: string;
}

export interface getAllSources {
  allSources: getAllSources_allSources[];
}
