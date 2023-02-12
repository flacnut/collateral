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

export type Account = {
  __typename?: 'Account';
  currency?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  institution: Institution;
  institutionId: Scalars['String'];
  invertBalances: Scalars['Boolean'];
  invertTransactions: Scalars['Boolean'];
  itemId: Scalars['String'];
  latestBalance: AccountBalance;
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


export type AccountTransactionsArgs = {
  after?: InputMaybe<Scalars['Float']>;
};

export type AccountBalance = {
  __typename?: 'AccountBalance';
  accountId: Scalars['String'];
  availableCents: Scalars['Int'];
  balanceCents: Scalars['Int'];
  currency?: Maybe<Scalars['String']>;
  lastUpdateDate: Scalars['String'];
  limitCents: Scalars['Int'];
};

export type AggregatedTransaction = {
  __typename?: 'AggregatedTransaction';
  account?: Maybe<Account>;
  classification?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  month?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Tag>>;
  totalDepositCents: Scalars['Int'];
  totalExpenseCents: Scalars['Int'];
  transactionCount: Scalars['Int'];
  transactionIds: Array<Scalars['String']>;
};

export type AnyTransaction = InvestmentTransaction | Transaction;

export type CoreTransaction = {
  __typename?: 'CoreTransaction';
  account: Account;
  accountId: Scalars['String'];
  amount: Scalars['Float'];
  amountCents: Scalars['Int'];
  classification?: Maybe<TransactionClassification>;
  currency?: Maybe<Scalars['String']>;
  date: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['String'];
  tags: Array<Tag>;
};

export type Institution = {
  __typename?: 'Institution';
  countryCodes: Scalars['String'];
  id: Scalars['String'];
  logo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  primaryColor?: Maybe<Scalars['String']>;
  products: Scalars['String'];
  url?: Maybe<Scalars['String']>;
};

export type InvestmentHolding = {
  __typename?: 'InvestmentHolding';
  accountId: Scalars['String'];
  costBasisCents: Scalars['Int'];
  currency?: Maybe<Scalars['String']>;
  institutionPriceAsOfDate?: Maybe<Scalars['String']>;
  institutionPriceCents: Scalars['Int'];
  institutionValueCents: Scalars['Int'];
  quantity: Scalars['Float'];
  securityId: Scalars['String'];
};

export type InvestmentTransaction = {
  __typename?: 'InvestmentTransaction';
  account: Account;
  accountId: Scalars['String'];
  amount: Scalars['Float'];
  amountCents: Scalars['Int'];
  classification?: Maybe<TransactionClassification>;
  currency?: Maybe<Scalars['String']>;
  date: Scalars['String'];
  description: Scalars['String'];
  feesCents: Scalars['Int'];
  id: Scalars['String'];
  quantity: Scalars['Float'];
  securityId: Scalars['String'];
  subType: Scalars['String'];
  tags: Array<Tag>;
  type: Scalars['String'];
  unitPriceCents: Scalars['Int'];
};

export type LinkTokenResult = {
  __typename?: 'LinkTokenResult';
  error?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createTag: Tag;
  deleteAccount: Scalars['Boolean'];
  deleteTag: Scalars['Boolean'];
  saveTransfers: Array<Transfer>;
  setPlaidLinkResponse: PlaidItem;
};


export type MutationCreateTagArgs = {
  options: TagCreateInput;
};


export type MutationDeleteAccountArgs = {
  accountId: Scalars['String'];
};


export type MutationDeleteTagArgs = {
  id: Scalars['Int'];
};


export type MutationSaveTransfersArgs = {
  transfers: Array<UnsavedTransfer>;
};


export type MutationSetPlaidLinkResponseArgs = {
  plaidLinkResponse: PlaidLinkResponse;
};

export type PlaidItem = {
  __typename?: 'PlaidItem';
  accounts: Array<Account>;
  id: Scalars['String'];
  institution: Institution;
  institutionId: Scalars['String'];
};

export type PlaidLinkResponse = {
  institutionId: Scalars['String'];
  linkSessionId: Scalars['String'];
  publicToken: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  fetchAccounts: Array<Account>;
  fetchInvestmentHoldings: Array<InvestmentHolding>;
  fetchInvestmentTransactions: Array<InvestmentTransaction>;
  fetchTransactions: Array<Transaction>;
  getAccounts: Array<Account>;
  getAggregatedTransactions: Array<AggregatedTransaction>;
  getAllInstitutions: Array<Institution>;
  getInstitution: Institution;
  getInvestmentTransactions: Array<InvestmentTransaction>;
  getItems: Array<PlaidItem>;
  getLinkToken: LinkTokenResult;
  getPossibleTransfers: Array<Transfer>;
  getTransactions: Array<AnyTransaction>;
  refreshPlaidItems: Scalars['Boolean'];
  tags: Array<Tag>;
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


export type QueryFetchTransactionsArgs = {
  itemId: Scalars['String'];
};


export type QueryGetAccountsArgs = {
  accountIds?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryGetAggregatedTransactionsArgs = {
  options: QueryAggregationOptions;
};


export type QueryGetInstitutionArgs = {
  institutionId: Scalars['String'];
};


export type QueryGetInvestmentTransactionsArgs = {
  accountId?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['Float']>;
  limit?: InputMaybe<Scalars['Float']>;
};


export type QueryGetTransactionsArgs = {
  accountId?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QueryTransactionDetailsArgs = {
  accountId?: InputMaybe<Scalars['String']>;
};

export type QueryAggregationOptions = {
  account?: InputMaybe<Scalars['Boolean']>;
  classification?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['Boolean']>;
  month?: InputMaybe<Scalars['Boolean']>;
  tags?: InputMaybe<Scalars['Boolean']>;
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type TagCreateInput = {
  tag: Scalars['String'];
};

export type Transaction = {
  __typename?: 'Transaction';
  account: Account;
  accountId: Scalars['String'];
  amount: Scalars['Float'];
  amountCents: Scalars['Int'];
  authorizedDate: Scalars['String'];
  authorizedDateTime: Scalars['String'];
  category: Scalars['String'];
  categoryId: Scalars['String'];
  classification?: Maybe<TransactionClassification>;
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
  tags: Array<Tag>;
  transactionCode: Scalars['String'];
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
  Income = 'Income',
  Investment = 'Investment',
  Recurring = 'Recurring',
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
      { __typename?: 'Account', latestBalance: (
        { __typename?: 'AccountBalance' }
        & { ' $fragmentRefs'?: { 'BalancePartsFragment': BalancePartsFragment } }
      ), latestTransaction?: { __typename?: 'CoreTransaction', date: string } | null, institution: (
        { __typename?: 'Institution' }
        & { ' $fragmentRefs'?: { 'InstitutionPartsFragment': InstitutionPartsFragment } }
      ) }
      & { ' $fragmentRefs'?: { 'AccountPartsFragment': AccountPartsFragment } }
    )> }> };

export type AccountPartsFragment = { __typename?: 'Account', id: string, name: string, mask?: string | null, type: string, subtype?: string | null, officialName?: string | null, status: string, currency?: string | null, totalTransactions: number } & { ' $fragmentName'?: 'AccountPartsFragment' };

export type BalancePartsFragment = { __typename?: 'AccountBalance', balanceCents: number, limitCents: number, lastUpdateDate: string, availableCents: number } & { ' $fragmentName'?: 'BalancePartsFragment' };

export type InstitutionPartsFragment = { __typename?: 'Institution', id: string, url?: string | null, name: string, logo?: string | null, products: string, countryCodes: string, primaryColor?: string | null } & { ' $fragmentName'?: 'InstitutionPartsFragment' };

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
    { __typename: 'InvestmentTransaction', account: { __typename?: 'Account', id: string, name: string } }
    & { ' $fragmentRefs'?: { 'CoreInvestmentTransactionPartsFragment': CoreInvestmentTransactionPartsFragment } }
  ) | (
    { __typename: 'Transaction', account: { __typename?: 'Account', id: string, name: string } }
    & { ' $fragmentRefs'?: { 'CoreTransactionPartsFragment': CoreTransactionPartsFragment } }
  )> };

export type CoreTransactionPartsFragment = { __typename?: 'Transaction', id: string, accountId: string, description: string, amountCents: number, amount: number, date: string, currency?: string | null, classification?: TransactionClassification | null } & { ' $fragmentName'?: 'CoreTransactionPartsFragment' };

export type CoreInvestmentTransactionPartsFragment = { __typename?: 'InvestmentTransaction', id: string, accountId: string, description: string, amountCents: number, amount: number, date: string, currency?: string | null, classification?: TransactionClassification | null } & { ' $fragmentName'?: 'CoreInvestmentTransactionPartsFragment' };

export type GetPossibleTransfersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPossibleTransfersQuery = { __typename?: 'Query', getPossibleTransfers: Array<{ __typename?: 'Transfer', date: string, amountCents: number, to: (
      { __typename?: 'CoreTransaction', account: { __typename?: 'Account', id: string, name: string, mask?: string | null, institution: { __typename?: 'Institution', id: string, name: string, logo?: string | null, primaryColor?: string | null } } }
      & { ' $fragmentRefs'?: { 'PartsFragment': PartsFragment } }
    ), from: (
      { __typename?: 'CoreTransaction', account: { __typename?: 'Account', id: string, name: string, mask?: string | null, institution: { __typename?: 'Institution', id: string, name: string, logo?: string | null, primaryColor?: string | null } } }
      & { ' $fragmentRefs'?: { 'PartsFragment': PartsFragment } }
    ) }> };

export type PartsFragment = { __typename?: 'CoreTransaction', id: string, accountId: string, description: string, amountCents: number, amount: number, date: string, currency?: string | null, classification?: TransactionClassification | null } & { ' $fragmentName'?: 'PartsFragment' };

export type SaveTransfersMutationVariables = Exact<{
  transfers: Array<UnsavedTransfer> | UnsavedTransfer;
}>;


export type SaveTransfersMutation = { __typename?: 'Mutation', saveTransfers: Array<{ __typename?: 'Transfer', to: (
      { __typename?: 'CoreTransaction' }
      & { ' $fragmentRefs'?: { 'PartsFragment': PartsFragment } }
    ), from: (
      { __typename?: 'CoreTransaction' }
      & { ' $fragmentRefs'?: { 'PartsFragment': PartsFragment } }
    ) }> };

export const AccountPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mask"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"subtype"}},{"kind":"Field","name":{"kind":"Name","value":"officialName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"totalTransactions"}}]}}]} as unknown as DocumentNode<AccountPartsFragment, unknown>;
export const BalancePartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BalanceParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AccountBalance"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balanceCents"}},{"kind":"Field","name":{"kind":"Name","value":"limitCents"}},{"kind":"Field","name":{"kind":"Name","value":"lastUpdateDate"}},{"kind":"Field","name":{"kind":"Name","value":"availableCents"}}]}}]} as unknown as DocumentNode<BalancePartsFragment, unknown>;
export const InstitutionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InstitutionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Institution"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"products"}},{"kind":"Field","name":{"kind":"Name","value":"countryCodes"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}}]}}]} as unknown as DocumentNode<InstitutionPartsFragment, unknown>;
export const CoreTransactionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CoreTransactionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}}]}}]} as unknown as DocumentNode<CoreTransactionPartsFragment, unknown>;
export const CoreInvestmentTransactionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CoreInvestmentTransactionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvestmentTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}}]}}]} as unknown as DocumentNode<CoreInvestmentTransactionPartsFragment, unknown>;
export const PartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"parts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CoreTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}}]}}]} as unknown as DocumentNode<PartsFragment, unknown>;
export const GetItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}},{"kind":"Field","name":{"kind":"Name","value":"latestBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BalanceParts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"latestTransaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}}]}},{"kind":"Field","name":{"kind":"Name","value":"institution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"InstitutionParts"}}]}}]}}]}}]}},...AccountPartsFragmentDoc.definitions,...BalancePartsFragmentDoc.definitions,...InstitutionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetItemsQuery, GetItemsQueryVariables>;
export const GetTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getLinkToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<GetTokenQuery, GetTokenQueryVariables>;
export const SetPlaidLinkResponseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"setPlaidLinkResponse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"plaidLinkResponse"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidLinkResponse"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setPlaidLinkResponse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"plaidLinkResponse"},"value":{"kind":"Variable","name":{"kind":"Name","value":"plaidLinkResponse"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"institutionId"}}]}}]}}]} as unknown as DocumentNode<SetPlaidLinkResponseMutation, SetPlaidLinkResponseMutationVariables>;
export const DeletAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deletAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}]}]}}]} as unknown as DocumentNode<DeletAccountMutation, DeletAccountMutationVariables>;
export const GetBasicTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getBasicTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvestmentTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreInvestmentTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},...CoreTransactionPartsFragmentDoc.definitions,...CoreInvestmentTransactionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetBasicTransactionsQuery, GetBasicTransactionsQueryVariables>;
export const GetPossibleTransfersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getPossibleTransfers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPossibleTransfers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"to"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"parts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mask"}},{"kind":"Field","name":{"kind":"Name","value":"institution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"from"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"parts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mask"}},{"kind":"Field","name":{"kind":"Name","value":"institution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}}]}}]}}]}}]}}]}},...PartsFragmentDoc.definitions]} as unknown as DocumentNode<GetPossibleTransfersQuery, GetPossibleTransfersQueryVariables>;
export const SaveTransfersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"saveTransfers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transfers"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnsavedTransfer"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveTransfers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"transfers"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transfers"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"to"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"parts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"from"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"parts"}}]}}]}}]}},...PartsFragmentDoc.definitions]} as unknown as DocumentNode<SaveTransfersMutation, SaveTransfersMutationVariables>;