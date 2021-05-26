/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

/**
 * How one set filters of another set.
 */
export enum ListOptions {
  ALL_OF = "ALL_OF",
  ANY_OF = "ANY_OF",
  EMPTY = "EMPTY",
  NONE_OF = "NONE_OF",
  NOT_EMPTY = "NOT_EMPTY",
}

/**
 * How number values are compared.
 */
export enum NumberCompareOptions {
  BETWEEN = "BETWEEN",
  EQUALS = "EQUALS",
  GREATER_THAN = "GREATER_THAN",
  GREATER_THAN_OET = "GREATER_THAN_OET",
  LESS_THAN = "LESS_THAN",
  LESS_THAN_OET = "LESS_THAN_OET",
}

/**
 * How strings are compared.
 */
export enum TextMatchOptions {
  CONTAINS = "CONTAINS",
  ENDS_WITH = "ENDS_WITH",
  EQUALS = "EQUALS",
  STARTS_WITH = "STARTS_WITH",
}

export interface AccountCreateInput {
  accountName: string;
  accountNumber: string;
  institution: string;
  currency?: string | null;
}

export interface AmountFilter {
  amountCents: number;
  secondAmountCents?: number | null;
  compare: NumberCompareOptions;
}

export interface DateFilter {
  value: any;
  secondValue: any;
  compare: NumberCompareOptions;
}

export interface ListFilter {
  itemIds: number[];
  queryBy: ListOptions;
}

export interface RichQuery {
  where: RichQueryFilter;
}

export interface RichQueryFilter {
  amount?: AmountFilter | null;
  description?: TextFilter | null;
  date?: DateFilter | null;
  tags?: ListFilter | null;
  accounts?: ListFilter | null;
  excludeTransfers: boolean;
}

export interface TagRuleCreateInput {
  name: string;
  descriptionContains?: string | null;
  minimumAmount?: number | null;
  maximumAmount?: number | null;
  forAccounts?: number[] | null;
  tagsToAdd: number[];
}

export interface TextFilter {
  text: string[];
  match: TextMatchOptions;
}

export interface TransactionBulkCreateInput {
  date: any;
  originalDescription: string;
  friendlyDescription?: string | null;
  amountCents: number;
}

export interface TransactionCreateInput {
  date: any;
  originalDescription: string;
  friendlyDescription?: string | null;
  amountCents: number;
  sourceId: number;
  accountId: number;
}

export interface TransactionUpdateTagsInput {
  id: number;
  tags: number[];
}

//==============================================================
// END Enums and Input Objects
//==============================================================
