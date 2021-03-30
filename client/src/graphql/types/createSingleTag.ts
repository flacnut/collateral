/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: createSingleTag
// ====================================================

export interface createSingleTag_createTag {
  __typename: "Tag";
  id: number;
  tag: string;
}

export interface createSingleTag {
  createTag: createSingleTag_createTag;
}

export interface createSingleTagVariables {
  tag: string;
}
