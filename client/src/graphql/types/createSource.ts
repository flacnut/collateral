/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: createSource
// ====================================================

export interface createSource_createSource {
  __typename: "Source";
  id: number;
  fileName: string;
}

export interface createSource {
  createSource: createSource_createSource;
}

export interface createSourceVariables {
  name: string;
}
