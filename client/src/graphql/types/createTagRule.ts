/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TagRuleCreateInput } from "./../graphql-global-types";

// ====================================================
// GraphQL mutation operation: createTagRule
// ====================================================

export interface createTagRule_createTagRule_tagsToAdd {
  __typename: "Tag";
  id: number;
  tag: string;
}

export interface createTagRule_createTagRule_thisTag {
  __typename: "Tag";
  id: number;
  tag: string;
}

export interface createTagRule_createTagRule_forAccounts {
  __typename: "Account";
  id: number;
  institution: string;
  accountName: string;
  accountNumber: string;
}

export interface createTagRule_createTagRule {
  __typename: "TagRule";
  id: number;
  name: string;
  minimumAmount: number | null;
  maximumAmount: number | null;
  descriptionContains: string | null;
  tagsToAdd: createTagRule_createTagRule_tagsToAdd[];
  thisTag: createTagRule_createTagRule_thisTag;
  forAccounts: createTagRule_createTagRule_forAccounts[] | null;
}

export interface createTagRule {
  createTagRule: createTagRule_createTagRule;
}

export interface createTagRuleVariables {
  options: TagRuleCreateInput;
}
