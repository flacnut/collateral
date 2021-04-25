/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface AccountCreateInput {
  accountName: string;
  accountNumber: string;
  institution: string;
  currency?: string | null;
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
