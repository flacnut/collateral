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
  classification: TransactionClassification;
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
  deleteAccount: Scalars['Boolean'];
  saveTransfers: Array<Transfer>;
  setPlaidLinkResponse: PlaidItem;
};


export type MutationDeleteAccountArgs = {
  accountId: Scalars['String'];
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
  invertBalances: Scalars['Boolean'];
  invertTransactions: Scalars['Boolean'];
  itemId: Scalars['String'];
  latestBalance: PlaidAccountBalance;
  latestTransaction?: Maybe<CoreTransaction>;
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
  classification: TransactionClassification;
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
  classification: TransactionClassification;
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
  pending: Scalars['Boolean'];
  transactionCode: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  fetchAccounts: Array<PlaidAccount>;
  fetchHoldings: Array<PlaidInvestmentHolding>;
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


export type QueryFetchHoldingsArgs = {
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
  after?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
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

/** Some general transaction classifications */
export enum TransactionClassification {
  Duplicate = 'Duplicate',
  Expense = 'Expense',
  Recurring = 'Recurring',
  Salary = 'Salary',
  Transfer = 'Transfer'
}

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
      ), latestTransaction?: { __typename?: 'CoreTransaction', date: string } | null, institution: (
        { __typename?: 'PlaidInstitution' }
        & { ' $fragmentRefs'?: { 'InstitutionPartsFragment': InstitutionPartsFragment } }
      ) }
      & { ' $fragmentRefs'?: { 'AccountPartsFragment': AccountPartsFragment } }
    )> }> };

export type AccountPartsFragment = { __typename?: 'PlaidAccount', id: string, name: string, mask?: string | null, type: string, subtype?: string | null, officialName?: string | null, status: string, currency?: string | null, totalTransactions: number } & { ' $fragmentName'?: 'AccountPartsFragment' };

export type BalancePartsFragment = { __typename?: 'PlaidAccountBalance', balanceCents: number, limitCents: number, lastUpdateDate: string, availableCents: number } & { ' $fragmentName'?: 'BalancePartsFragment' };

export type InstitutionPartsFragment = { __typename?: 'PlaidInstitution', id: string, url?: string | null, name: string, logo?: string | null, products: string, countryCodes: string, primaryColor?: string | null } & { ' $fragmentName'?: 'InstitutionPartsFragment' };

export type GetTokenQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTokenQuery = { __typename?: 'Query', getLinkToken: { __typename?: 'LinkTokenResult', token?: string | null, error?: string | null } };

export type SetPlaidLinkResponseMutationVariables = Exact<{
  plaidLinkResponse: PlaidLinkResponse;
}>;


export type SetPlaidLinkResponseMutation = { __typename?: 'Mutation', setPlaidLinkResponse: { __typename?: 'PlaidItem', id: string, institutionId: string } };

export type DeletAccountMutationVariables = Exact<{
  accountId: Scalars['String'];
}>;


export type DeletAccountMutation = { __typename?: 'Mutation', deleteAccount: boolean };

export type GetBasicTransactionsQueryVariables = Exact<{
  accountId?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}>;


export type GetBasicTransactionsQuery = { __typename?: 'Query', getTransactions: Array<(
    { __typename: 'PlaidHoldingTransaction' }
    & { ' $fragmentRefs'?: { 'CoreHoldingTransactionPartsFragment': CoreHoldingTransactionPartsFragment } }
  ) | (
    { __typename: 'PlaidTransaction' }
    & { ' $fragmentRefs'?: { 'CorePlaidTransactionPartsFragment': CorePlaidTransactionPartsFragment } }
  )> };

export type CorePlaidTransactionPartsFragment = { __typename?: 'PlaidTransaction', id: string, accountId: string, description: string, amountCents: number, amount: number, date: string, currency?: string | null, classification: TransactionClassification } & { ' $fragmentName'?: 'CorePlaidTransactionPartsFragment' };

export type CoreHoldingTransactionPartsFragment = { __typename?: 'PlaidHoldingTransaction', id: string, accountId: string, description: string, amountCents: number, amount: number, date: string, currency?: string | null, classification: TransactionClassification } & { ' $fragmentName'?: 'CoreHoldingTransactionPartsFragment' };

export const AccountPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidAccount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mask"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"subtype"}},{"kind":"Field","name":{"kind":"Name","value":"officialName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"totalTransactions"}}]}}]} as unknown as DocumentNode<AccountPartsFragment, unknown>;
export const BalancePartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BalanceParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidAccountBalance"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balanceCents"}},{"kind":"Field","name":{"kind":"Name","value":"limitCents"}},{"kind":"Field","name":{"kind":"Name","value":"lastUpdateDate"}},{"kind":"Field","name":{"kind":"Name","value":"availableCents"}}]}}]} as unknown as DocumentNode<BalancePartsFragment, unknown>;
export const InstitutionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InstitutionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidInstitution"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"products"}},{"kind":"Field","name":{"kind":"Name","value":"countryCodes"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}}]}}]} as unknown as DocumentNode<InstitutionPartsFragment, unknown>;
export const CorePlaidTransactionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CorePlaidTransactionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}}]}}]} as unknown as DocumentNode<CorePlaidTransactionPartsFragment, unknown>;
export const CoreHoldingTransactionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CoreHoldingTransactionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidHoldingTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}}]}}]} as unknown as DocumentNode<CoreHoldingTransactionPartsFragment, unknown>;
export const GetItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}},{"kind":"Field","name":{"kind":"Name","value":"latestBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BalanceParts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"latestTransaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}}]}},{"kind":"Field","name":{"kind":"Name","value":"institution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"InstitutionParts"}}]}}]}}]}}]}},...AccountPartsFragmentDoc.definitions,...BalancePartsFragmentDoc.definitions,...InstitutionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetItemsQuery, GetItemsQueryVariables>;
export const GetTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getLinkToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<GetTokenQuery, GetTokenQueryVariables>;
export const SetPlaidLinkResponseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"setPlaidLinkResponse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"plaidLinkResponse"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidLinkResponse"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setPlaidLinkResponse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"plaidLinkResponse"},"value":{"kind":"Variable","name":{"kind":"Name","value":"plaidLinkResponse"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"institutionId"}}]}}]}}]} as unknown as DocumentNode<SetPlaidLinkResponseMutation, SetPlaidLinkResponseMutationVariables>;
export const DeletAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deletAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}]}]}}]} as unknown as DocumentNode<DeletAccountMutation, DeletAccountMutationVariables>;
export const GetBasicTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getBasicTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CorePlaidTransactionParts"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidHoldingTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreHoldingTransactionParts"}}]}}]}}]}},...CorePlaidTransactionPartsFragmentDoc.definitions,...CoreHoldingTransactionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetBasicTransactionsQuery, GetBasicTransactionsQueryVariables>;