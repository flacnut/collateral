/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AnyTransaction = PlaidHoldingTransaction | PlaidTransaction;

export type CoreTransaction = {
  __typename?: 'CoreTransaction';
  accountId: Scalars['String'];
  amount: Scalars['Float'];
  amountCents: Scalars['Int'];
  currency?: Maybe<Scalars['String']>;
  date: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['String'];
};

export type LinkTokenResult = {
  __typename?: 'LinkTokenResult';
  error?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  saveTransfers: Array<Transfer>;
  setPlaidLinkResponse: PlaidItem;
};


export type MutationSaveTransfersArgs = {
  transfers: Array<UnsavedTransfer>;
};


export type MutationSetPlaidLinkResponseArgs = {
  plaidLinkResponse: PlaidLinkResponse;
};

export type PlaidAccount = {
  __typename?: 'PlaidAccount';
  currency?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  institution: PlaidInstitution;
  institutionId: Scalars['String'];
  itemId: Scalars['String'];
  latestBalance: PlaidAccountBalance;
  mask?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  officialName?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  subtype?: Maybe<Scalars['String']>;
  totalTransactions: Scalars['Int'];
  transactions: Array<CoreTransaction>;
  type: Scalars['String'];
};


export type PlaidAccountTransactionsArgs = {
  after?: InputMaybe<Scalars['Float']>;
};

export type PlaidAccountBalance = {
  __typename?: 'PlaidAccountBalance';
  accountId: Scalars['String'];
  availableCents: Scalars['Int'];
  balanceCents: Scalars['Int'];
  currency?: Maybe<Scalars['String']>;
  lastUpdateDate: Scalars['String'];
  limitCents: Scalars['Int'];
};

export type PlaidHoldingTransaction = {
  __typename?: 'PlaidHoldingTransaction';
  accountId: Scalars['String'];
  amount: Scalars['Float'];
  amountCents: Scalars['Int'];
  currency?: Maybe<Scalars['String']>;
  date: Scalars['String'];
  description: Scalars['String'];
  feesCents: Scalars['Int'];
  id: Scalars['String'];
  quantity: Scalars['Float'];
  securityId: Scalars['String'];
  subType: Scalars['String'];
  type: Scalars['String'];
  unitPriceCents: Scalars['Int'];
};

export type PlaidInstitution = {
  __typename?: 'PlaidInstitution';
  countryCodes: Scalars['String'];
  id: Scalars['String'];
  logo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  primaryColor?: Maybe<Scalars['String']>;
  products: Scalars['String'];
  url?: Maybe<Scalars['String']>;
};

export type PlaidInvestmentHolding = {
  __typename?: 'PlaidInvestmentHolding';
  accountId: Scalars['String'];
  costBasisCents: Scalars['Int'];
  currency?: Maybe<Scalars['String']>;
  institutionPriceAsOfDate?: Maybe<Scalars['String']>;
  institutionPriceCents: Scalars['Int'];
  institutionValueCents: Scalars['Int'];
  quantity: Scalars['Float'];
  securityId: Scalars['String'];
};

export type PlaidItem = {
  __typename?: 'PlaidItem';
  accounts: Array<PlaidAccount>;
  id: Scalars['String'];
  institution: PlaidInstitution;
  institutionId: Scalars['String'];
};

export type PlaidLinkResponse = {
  institutionId: Scalars['String'];
  linkSessionId: Scalars['String'];
  publicToken: Scalars['String'];
};

export type PlaidTransaction = {
  __typename?: 'PlaidTransaction';
  accountId: Scalars['String'];
  amount: Scalars['Float'];
  amountCents: Scalars['Int'];
  authorizedDate: Scalars['String'];
  authorizedDateTime: Scalars['String'];
  category: Scalars['String'];
  categoryId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  date: Scalars['String'];
  dateTime: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['String'];
  locationJson: Scalars['String'];
  merchant: Scalars['String'];
  originalDescription: Scalars['String'];
  paymentChannel: Scalars['String'];
  paymentMetaJson: Scalars['String'];
  transactionCode: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  fetchAccounts: Array<PlaidAccount>;
  fetchInvestmentHoldings: Array<PlaidInvestmentHolding>;
  fetchInvestmentTransactions: Array<PlaidHoldingTransaction>;
  fetchPlaidTransactions: Array<PlaidTransaction>;
  getAccounts: Array<PlaidAccount>;
  getAllInstitutions: Array<PlaidInstitution>;
  getHoldingTransactions: Array<PlaidHoldingTransaction>;
  getInstitution: PlaidInstitution;
  getItems: Array<PlaidItem>;
  getLinkToken: LinkTokenResult;
  getPossibleTransfers: Array<Transfer>;
  getTransactions: Array<AnyTransaction>;
  refreshPlaidItems: Scalars['Boolean'];
  transactionDetails: Array<TransactionCategory>;
};


export type QueryFetchAccountsArgs = {
  itemId: Scalars['String'];
};


export type QueryFetchInvestmentHoldingsArgs = {
  itemId: Scalars['String'];
};


export type QueryFetchInvestmentTransactionsArgs = {
  itemId: Scalars['String'];
};


export type QueryFetchPlaidTransactionsArgs = {
  itemId: Scalars['String'];
};


export type QueryGetAccountsArgs = {
  accountIds?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryGetHoldingTransactionsArgs = {
  accountId?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['Float']>;
  limit?: InputMaybe<Scalars['Float']>;
};


export type QueryGetInstitutionArgs = {
  institutionId: Scalars['String'];
};


export type QueryGetTransactionsArgs = {
  accountId?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['Float']>;
  limit?: InputMaybe<Scalars['Float']>;
};


export type QueryTransactionDetailsArgs = {
  accountId?: InputMaybe<Scalars['String']>;
};

export type TransactionCategory = {
  __typename?: 'TransactionCategory';
  category: Scalars['String'];
  count: Scalars['Float'];
  value: Scalars['Float'];
};

export type Transfer = {
  __typename?: 'Transfer';
  amountCents: Scalars['Int'];
  date: Scalars['String'];
  from: CoreTransaction;
  to: CoreTransaction;
};

export type UnsavedTransfer = {
  fromId: Scalars['String'];
  toId: Scalars['String'];
};

export type GetItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetItemsQuery = { __typename?: 'Query', getItems: Array<{ __typename?: 'PlaidItem', id: string, accounts: Array<(
      { __typename?: 'PlaidAccount', latestBalance: (
        { __typename?: 'PlaidAccountBalance' }
        & { ' $fragmentRefs'?: { 'BalancePartsFragment': BalancePartsFragment } }
      ), institution: (
        { __typename?: 'PlaidInstitution' }
        & { ' $fragmentRefs'?: { 'InstitutionPartsFragment': InstitutionPartsFragment } }
      ) }
      & { ' $fragmentRefs'?: { 'AccountPartsFragment': AccountPartsFragment } }
    )> }> };

export type AccountPartsFragment = { __typename?: 'PlaidAccount', id: string, name: string, mask?: string | null, type: string, subtype?: string | null, officialName?: string | null, status: string, currency?: string | null, totalTransactions: number } & { ' $fragmentName'?: 'AccountPartsFragment' };

export type BalancePartsFragment = { __typename?: 'PlaidAccountBalance', balanceCents: number, limitCents: number, lastUpdateDate: string, availableCents: number } & { ' $fragmentName'?: 'BalancePartsFragment' };

export type InstitutionPartsFragment = { __typename?: 'PlaidInstitution', id: string, url?: string | null, name: string, logo?: string | null, products: string, countryCodes: string, primaryColor?: string | null } & { ' $fragmentName'?: 'InstitutionPartsFragment' };

export const AccountPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mask"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"subtype"}},{"kind":"Field","name":{"kind":"Name","value":"officialName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"totalTransactions"}}]}}]} as unknown as DocumentNode<AccountPartsFragment, unknown>;
export const BalancePartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BalanceParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidAccountBalance"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balanceCents"}},{"kind":"Field","name":{"kind":"Name","value":"limitCents"}},{"kind":"Field","name":{"kind":"Name","value":"lastUpdateDate"}},{"kind":"Field","name":{"kind":"Name","value":"availableCents"}}]}}]} as unknown as DocumentNode<BalancePartsFragment, unknown>;
export const InstitutionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InstitutionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidInstitution"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"products"}},{"kind":"Field","name":{"kind":"Name","value":"countryCodes"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}}]}}]} as unknown as DocumentNode<InstitutionPartsFragment, unknown>;
export const GetItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}},{"kind":"Field","name":{"kind":"Name","value":"latestBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BalanceParts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"institution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"InstitutionParts"}}]}}]}}]}}]}},...AccountPartsFragmentDoc.definitions,...BalancePartsFragmentDoc.definitions,...InstitutionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetItemsQuery, GetItemsQueryVariables>;