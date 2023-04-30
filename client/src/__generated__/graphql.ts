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

export type AnyTransaction = BackfilledTransaction | InvestmentTransaction | Transaction;

export type BackfilledTransaction = {
  __typename?: 'BackfilledTransaction';
  account: Account;
  accountId: Scalars['String'];
  amount: Scalars['Float'];
  amountCents: Scalars['Int'];
  backfillDate: Scalars['String'];
  changeLog: Array<ChangeEvent>;
  classification?: Maybe<TransactionClassification>;
  currency?: Maybe<Scalars['String']>;
  date: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['String'];
  tags?: Maybe<Array<Tag>>;
};

export type ChangeEvent = {
  __typename?: 'ChangeEvent';
  column: Scalars['String'];
  date: Scalars['String'];
  newValue: Scalars['String'];
  oldValue?: Maybe<Scalars['String']>;
};

export type CoreTransaction = {
  __typename?: 'CoreTransaction';
  account: Account;
  accountId: Scalars['String'];
  amount: Scalars['Float'];
  amountCents: Scalars['Int'];
  changeLog: Array<ChangeEvent>;
  classification?: Maybe<TransactionClassification>;
  currency?: Maybe<Scalars['String']>;
  date: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['String'];
  tags?: Maybe<Array<Tag>>;
};

export type GroupedTransactions = {
  __typename?: 'GroupedTransactions';
  key: Scalars['String'];
  transactions: Array<CoreTransaction>;
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
  changeLog: Array<ChangeEvent>;
  classification?: Maybe<TransactionClassification>;
  currency?: Maybe<Scalars['String']>;
  date: Scalars['String'];
  description: Scalars['String'];
  feesCents: Scalars['Int'];
  id: Scalars['String'];
  quantity: Scalars['Float'];
  security: Security;
  securityId: Scalars['String'];
  subType: Scalars['String'];
  tags?: Maybe<Array<Tag>>;
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
  deleteTransactions: Scalars['Boolean'];
  invertTransactionAmount: Array<AnyTransaction>;
  saveTransfers: Array<Transfer>;
  setPlaidLinkResponse: PlaidItem;
  updateTransactionClassification: Array<Transaction>;
  updateTransactionDescription: Array<AnyTransaction>;
  updateTransactionTags: Array<Transaction>;
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


export type MutationDeleteTransactionsArgs = {
  transactionIds: Array<Scalars['String']>;
};


export type MutationInvertTransactionAmountArgs = {
  transactionIds: Array<Scalars['String']>;
};


export type MutationSaveTransfersArgs = {
  transfers: Array<UnsavedTransfer>;
};


export type MutationSetPlaidLinkResponseArgs = {
  plaidLinkResponse: PlaidLinkResponse;
};


export type MutationUpdateTransactionClassificationArgs = {
  classification: TransactionClassification;
  transactionIds: Array<Scalars['String']>;
};


export type MutationUpdateTransactionDescriptionArgs = {
  description: Scalars['String'];
  transactionIds: Array<Scalars['String']>;
};


export type MutationUpdateTransactionTagsArgs = {
  addTags: Array<Scalars['String']>;
  force: Scalars['Boolean'];
  removeTags: Array<Scalars['String']>;
  transactionIds: Array<Scalars['String']>;
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
  getDuplicates: Array<GroupedTransactions>;
  getInstitution: Institution;
  getInvestmentTransactions: Array<InvestmentTransaction>;
  getItems: Array<PlaidItem>;
  getLinkToken: LinkTokenResult;
  getPossibleTransfers: Array<Transfer>;
  getTransaction?: Maybe<AnyTransaction>;
  getTransactions: Array<AnyTransaction>;
  getTransactionsById: Array<AnyTransaction>;
  getTransactionsByProperty: Array<AnyTransaction>;
  getTransfers: Array<Transfer>;
  refreshPlaidItems: Scalars['Boolean'];
  tags: Array<Tag>;
  tagsByFrequency: Array<TagFrequency>;
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


export type QueryGetDuplicatesArgs = {
  accountId?: InputMaybe<Scalars['String']>;
};


export type QueryGetInstitutionArgs = {
  institutionId: Scalars['String'];
};


export type QueryGetInvestmentTransactionsArgs = {
  accountId?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['Float']>;
  limit?: InputMaybe<Scalars['Float']>;
};


export type QueryGetLinkTokenArgs = {
  itemId?: InputMaybe<Scalars['String']>;
};


export type QueryGetTransactionArgs = {
  id: Scalars['String'];
};


export type QueryGetTransactionsArgs = {
  accountId?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QueryGetTransactionsByIdArgs = {
  ids: Array<Scalars['String']>;
};


export type QueryGetTransactionsByPropertyArgs = {
  properties: QueryTransactionsByPropertyOptions;
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
  unclassifiedOnly?: InputMaybe<Scalars['Boolean']>;
};

export type QueryTransactionsByPropertyOptions = {
  accountId?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
};

export type Security = {
  __typename?: 'Security';
  closePriceCents: Scalars['Int'];
  closePriceDate: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  cusip: Scalars['String'];
  id: Scalars['String'];
  isCashEquivalent: Scalars['Boolean'];
  isin: Scalars['String'];
  name: Scalars['String'];
  sedol: Scalars['String'];
  ticker: Scalars['String'];
  type: Scalars['String'];
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type TagCreateInput = {
  tag: Scalars['String'];
};

export type TagFrequency = {
  __typename?: 'TagFrequency';
  count: Scalars['Int'];
  tags: Array<Tag>;
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
  changeLog: Array<ChangeEvent>;
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
  tags?: Maybe<Array<Tag>>;
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
  Hidden = 'Hidden',
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

export type GetAggregatedTransactionsQueryVariables = Exact<{
  options: QueryAggregationOptions;
}>;


export type GetAggregatedTransactionsQuery = { __typename?: 'Query', getAggregatedTransactions: Array<{ __typename?: 'AggregatedTransaction', description?: string | null, month?: string | null, classification?: string | null, totalExpenseCents: number, totalDepositCents: number, transactionCount: number, transactionIds: Array<string> }> };

export type GetTransactionsbyIdQueryVariables = Exact<{
  ids: Array<Scalars['String']> | Scalars['String'];
}>;


export type GetTransactionsbyIdQuery = { __typename?: 'Query', getTransactionsById: Array<(
    { __typename: 'BackfilledTransaction', account: { __typename?: 'Account', name: string }, tags?: Array<{ __typename?: 'Tag', name: string }> | null }
    & { ' $fragmentRefs'?: { 'CoreBackfilledTransactionPartsFragment': CoreBackfilledTransactionPartsFragment } }
  ) | (
    { __typename: 'InvestmentTransaction', account: { __typename?: 'Account', name: string }, tags?: Array<{ __typename?: 'Tag', name: string }> | null }
    & { ' $fragmentRefs'?: { 'CoreInvestmentTransactionPartsFragment': CoreInvestmentTransactionPartsFragment } }
  ) | (
    { __typename: 'Transaction', account: { __typename?: 'Account', name: string }, tags?: Array<{ __typename?: 'Tag', name: string }> | null }
    & { ' $fragmentRefs'?: { 'CoreTransactionPartsFragment': CoreTransactionPartsFragment } }
  )> };

export type CoreTransactionPartsFragment = { __typename?: 'Transaction', id: string, accountId: string, description: string, amountCents: number, amount: number, date: string, currency?: string | null, classification?: TransactionClassification | null } & { ' $fragmentName'?: 'CoreTransactionPartsFragment' };

export type CoreBackfilledTransactionPartsFragment = { __typename?: 'BackfilledTransaction', id: string, accountId: string, description: string, amountCents: number, amount: number, date: string, currency?: string | null, classification?: TransactionClassification | null } & { ' $fragmentName'?: 'CoreBackfilledTransactionPartsFragment' };

export type CoreInvestmentTransactionPartsFragment = { __typename?: 'InvestmentTransaction', id: string, accountId: string, description: string, amountCents: number, amount: number, date: string, currency?: string | null, classification?: TransactionClassification | null } & { ' $fragmentName'?: 'CoreInvestmentTransactionPartsFragment' };

export type GetTransactionsByPropertyQueryVariables = Exact<{
  properties: QueryTransactionsByPropertyOptions;
}>;


export type GetTransactionsByPropertyQuery = { __typename?: 'Query', getTransactionsByProperty: Array<(
    { __typename: 'BackfilledTransaction', account: { __typename?: 'Account', name: string }, tags?: Array<{ __typename?: 'Tag', name: string }> | null }
    & { ' $fragmentRefs'?: { 'CoreBackfilledTransactionPartsFragment': CoreBackfilledTransactionPartsFragment } }
  ) | (
    { __typename: 'InvestmentTransaction', account: { __typename?: 'Account', name: string }, tags?: Array<{ __typename?: 'Tag', name: string }> | null }
    & { ' $fragmentRefs'?: { 'CoreInvestmentTransactionPartsFragment': CoreInvestmentTransactionPartsFragment } }
  ) | (
    { __typename: 'Transaction', account: { __typename?: 'Account', name: string }, tags?: Array<{ __typename?: 'Tag', name: string }> | null }
    & { ' $fragmentRefs'?: { 'CoreTransactionPartsFragment': CoreTransactionPartsFragment } }
  )> };

export type UpdateTransactionTagsMutationVariables = Exact<{
  force: Scalars['Boolean'];
  addTags: Array<Scalars['String']> | Scalars['String'];
  removeTags: Array<Scalars['String']> | Scalars['String'];
  transactionIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type UpdateTransactionTagsMutation = { __typename?: 'Mutation', updateTransactionTags: Array<{ __typename?: 'Transaction', id: string, tags?: Array<{ __typename?: 'Tag', name: string }> | null }> };

export type UpdateClassificationMutationVariables = Exact<{
  transactionIds: Array<Scalars['String']> | Scalars['String'];
  classification: TransactionClassification;
}>;


export type UpdateClassificationMutation = { __typename?: 'Mutation', updateTransactionClassification: Array<{ __typename?: 'Transaction', id: string }> };

export type GetTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTagsQuery = { __typename?: 'Query', tags: Array<{ __typename?: 'Tag', name: string }> };

export type SimilarTagsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SimilarTagsQueryQuery = { __typename?: 'Query', tagsByFrequency: Array<{ __typename?: 'TagFrequency', count: number, tags: Array<{ __typename?: 'Tag', name: string }> }> };

export type GetDuplicatesQueryVariables = Exact<{
  accountId?: InputMaybe<Scalars['String']>;
}>;


export type GetDuplicatesQuery = { __typename?: 'Query', getDuplicates: Array<{ __typename?: 'GroupedTransactions', key: string, transactions: Array<{ __typename?: 'CoreTransaction', id: string, amountCents: number }> }> };

export type GetTransactionQueryQueryVariables = Exact<{
  transactionId: Scalars['String'];
}>;


export type GetTransactionQueryQuery = { __typename?: 'Query', getTransaction?: (
    { __typename: 'BackfilledTransaction', account: { __typename?: 'Account', id: string, name: string } }
    & { ' $fragmentRefs'?: { 'CoreBackfilledTransactionPartsFragment': CoreBackfilledTransactionPartsFragment } }
  ) | (
    { __typename: 'InvestmentTransaction', account: { __typename?: 'Account', id: string, name: string } }
    & { ' $fragmentRefs'?: { 'CoreInvestmentTransactionPartsFragment': CoreInvestmentTransactionPartsFragment;'ExtraInvestmentTransactionPartsFragment': ExtraInvestmentTransactionPartsFragment } }
  ) | (
    { __typename: 'Transaction', account: { __typename?: 'Account', id: string, name: string } }
    & { ' $fragmentRefs'?: { 'CoreTransactionPartsFragment': CoreTransactionPartsFragment;'ExtraTransactionPartsFragment': ExtraTransactionPartsFragment } }
  ) | null };

export type ExtraTransactionPartsFragment = { __typename?: 'Transaction', category: string, categoryId: string, dateTime: string, authorizedDate: string, authorizedDateTime: string, locationJson: string, paymentMetaJson: string, originalDescription: string, merchant: string, paymentChannel: string, transactionCode: string, pending: boolean } & { ' $fragmentName'?: 'ExtraTransactionPartsFragment' };

export type ExtraInvestmentTransactionPartsFragment = { __typename?: 'InvestmentTransaction', securityId: string, feesCents: number, unitPriceCents: number, quantity: number, type: string, subType: string, security: { __typename?: 'Security', id: string, name: string, isin: string, ticker: string } } & { ' $fragmentName'?: 'ExtraInvestmentTransactionPartsFragment' };

export type GetAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAccountsQuery = { __typename?: 'Query', getAccounts: Array<{ __typename?: 'Account', id: string, name: string }> };

export type GetBasicTransactionsQueryVariables = Exact<{
  accountId?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}>;


export type GetBasicTransactionsQuery = { __typename?: 'Query', getTransactions: Array<(
    { __typename: 'BackfilledTransaction', account: { __typename?: 'Account', id: string, name: string }, tags?: Array<{ __typename?: 'Tag', name: string }> | null }
    & { ' $fragmentRefs'?: { 'CoreBackfilledTransactionPartsFragment': CoreBackfilledTransactionPartsFragment } }
  ) | (
    { __typename: 'InvestmentTransaction', account: { __typename?: 'Account', id: string, name: string }, tags?: Array<{ __typename?: 'Tag', name: string }> | null }
    & { ' $fragmentRefs'?: { 'CoreInvestmentTransactionPartsFragment': CoreInvestmentTransactionPartsFragment } }
  ) | (
    { __typename: 'Transaction', account: { __typename?: 'Account', id: string, name: string }, tags?: Array<{ __typename?: 'Tag', name: string }> | null }
    & { ' $fragmentRefs'?: { 'CoreTransactionPartsFragment': CoreTransactionPartsFragment } }
  )> };

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
export const CoreBackfilledTransactionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CoreBackfilledTransactionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BackfilledTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}}]}}]} as unknown as DocumentNode<CoreBackfilledTransactionPartsFragment, unknown>;
export const CoreInvestmentTransactionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CoreInvestmentTransactionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvestmentTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}}]}}]} as unknown as DocumentNode<CoreInvestmentTransactionPartsFragment, unknown>;
export const ExtraTransactionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExtraTransactionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"dateTime"}},{"kind":"Field","name":{"kind":"Name","value":"authorizedDate"}},{"kind":"Field","name":{"kind":"Name","value":"authorizedDateTime"}},{"kind":"Field","name":{"kind":"Name","value":"locationJson"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMetaJson"}},{"kind":"Field","name":{"kind":"Name","value":"originalDescription"}},{"kind":"Field","name":{"kind":"Name","value":"merchant"}},{"kind":"Field","name":{"kind":"Name","value":"paymentChannel"}},{"kind":"Field","name":{"kind":"Name","value":"transactionCode"}},{"kind":"Field","name":{"kind":"Name","value":"pending"}}]}}]} as unknown as DocumentNode<ExtraTransactionPartsFragment, unknown>;
export const ExtraInvestmentTransactionPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExtraInvestmentTransactionParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvestmentTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"securityId"}},{"kind":"Field","name":{"kind":"Name","value":"feesCents"}},{"kind":"Field","name":{"kind":"Name","value":"unitPriceCents"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"subType"}},{"kind":"Field","name":{"kind":"Name","value":"security"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isin"}},{"kind":"Field","name":{"kind":"Name","value":"ticker"}}]}}]}}]} as unknown as DocumentNode<ExtraInvestmentTransactionPartsFragment, unknown>;
export const PartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"parts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CoreTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}}]}}]} as unknown as DocumentNode<PartsFragment, unknown>;
export const GetItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}},{"kind":"Field","name":{"kind":"Name","value":"latestBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BalanceParts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"latestTransaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}}]}},{"kind":"Field","name":{"kind":"Name","value":"institution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"InstitutionParts"}}]}}]}}]}}]}},...AccountPartsFragmentDoc.definitions,...BalancePartsFragmentDoc.definitions,...InstitutionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetItemsQuery, GetItemsQueryVariables>;
export const GetTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getLinkToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<GetTokenQuery, GetTokenQueryVariables>;
export const SetPlaidLinkResponseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"setPlaidLinkResponse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"plaidLinkResponse"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlaidLinkResponse"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setPlaidLinkResponse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"plaidLinkResponse"},"value":{"kind":"Variable","name":{"kind":"Name","value":"plaidLinkResponse"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"institutionId"}}]}}]}}]} as unknown as DocumentNode<SetPlaidLinkResponseMutation, SetPlaidLinkResponseMutationVariables>;
export const DeletAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deletAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}]}]}}]} as unknown as DocumentNode<DeletAccountMutation, DeletAccountMutationVariables>;
export const GetAggregatedTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAggregatedTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"options"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"QueryAggregationOptions"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAggregatedTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"options"},"value":{"kind":"Variable","name":{"kind":"Name","value":"options"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenseCents"}},{"kind":"Field","name":{"kind":"Name","value":"totalDepositCents"}},{"kind":"Field","name":{"kind":"Name","value":"transactionCount"}},{"kind":"Field","name":{"kind":"Name","value":"transactionIds"}}]}}]}}]} as unknown as DocumentNode<GetAggregatedTransactionsQuery, GetAggregatedTransactionsQueryVariables>;
export const GetTransactionsbyIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getTransactionsbyId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getTransactionsById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BackfilledTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreBackfilledTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvestmentTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreInvestmentTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},...CoreTransactionPartsFragmentDoc.definitions,...CoreBackfilledTransactionPartsFragmentDoc.definitions,...CoreInvestmentTransactionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetTransactionsbyIdQuery, GetTransactionsbyIdQueryVariables>;
export const GetTransactionsByPropertyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getTransactionsByProperty"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"properties"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"QueryTransactionsByPropertyOptions"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getTransactionsByProperty"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"properties"},"value":{"kind":"Variable","name":{"kind":"Name","value":"properties"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BackfilledTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreBackfilledTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvestmentTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreInvestmentTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},...CoreTransactionPartsFragmentDoc.definitions,...CoreBackfilledTransactionPartsFragmentDoc.definitions,...CoreInvestmentTransactionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetTransactionsByPropertyQuery, GetTransactionsByPropertyQueryVariables>;
export const UpdateTransactionTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateTransactionTags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"force"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"addTags"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"removeTags"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transactionIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTransactionTags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"force"},"value":{"kind":"Variable","name":{"kind":"Name","value":"force"}}},{"kind":"Argument","name":{"kind":"Name","value":"addTags"},"value":{"kind":"Variable","name":{"kind":"Name","value":"addTags"}}},{"kind":"Argument","name":{"kind":"Name","value":"removeTags"},"value":{"kind":"Variable","name":{"kind":"Name","value":"removeTags"}}},{"kind":"Argument","name":{"kind":"Name","value":"transactionIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transactionIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateTransactionTagsMutation, UpdateTransactionTagsMutationVariables>;
export const UpdateClassificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateClassification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transactionIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classification"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionClassification"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTransactionClassification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"transactionIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transactionIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"classification"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classification"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateClassificationMutation, UpdateClassificationMutationVariables>;
export const GetTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetTagsQuery, GetTagsQueryVariables>;
export const SimilarTagsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"similarTagsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tagsByFrequency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<SimilarTagsQueryQuery, SimilarTagsQueryQueryVariables>;
export const GetDuplicatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getDuplicates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDuplicates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}}]}}]}}]}}]} as unknown as DocumentNode<GetDuplicatesQuery, GetDuplicatesQueryVariables>;
export const GetTransactionQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getTransactionQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transactionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transactionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreTransactionParts"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExtraTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BackfilledTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreBackfilledTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvestmentTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreInvestmentTransactionParts"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExtraInvestmentTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},...CoreTransactionPartsFragmentDoc.definitions,...ExtraTransactionPartsFragmentDoc.definitions,...CoreBackfilledTransactionPartsFragmentDoc.definitions,...CoreInvestmentTransactionPartsFragmentDoc.definitions,...ExtraInvestmentTransactionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetTransactionQueryQuery, GetTransactionQueryQueryVariables>;
export const GetAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetAccountsQuery, GetAccountsQueryVariables>;
export const GetBasicTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getBasicTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BackfilledTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreBackfilledTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvestmentTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CoreInvestmentTransactionParts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},...CoreTransactionPartsFragmentDoc.definitions,...CoreBackfilledTransactionPartsFragmentDoc.definitions,...CoreInvestmentTransactionPartsFragmentDoc.definitions]} as unknown as DocumentNode<GetBasicTransactionsQuery, GetBasicTransactionsQueryVariables>;
export const GetPossibleTransfersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getPossibleTransfers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPossibleTransfers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"amountCents"}},{"kind":"Field","name":{"kind":"Name","value":"to"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"parts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mask"}},{"kind":"Field","name":{"kind":"Name","value":"institution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"from"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"parts"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mask"}},{"kind":"Field","name":{"kind":"Name","value":"institution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}}]}}]}}]}}]}}]}},...PartsFragmentDoc.definitions]} as unknown as DocumentNode<GetPossibleTransfersQuery, GetPossibleTransfersQueryVariables>;
export const SaveTransfersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"saveTransfers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transfers"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnsavedTransfer"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveTransfers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"transfers"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transfers"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"to"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"parts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"from"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"parts"}}]}}]}}]}},...PartsFragmentDoc.definitions]} as unknown as DocumentNode<SaveTransfersMutation, SaveTransfersMutationVariables>;