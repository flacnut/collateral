import React, { useEffect, useState } from 'react';
import { Autocomplete, Card, Chip, Container, Stack, TextField, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from 'src/components/settings';

import { gql } from 'src/__generated__';
import { useLazyQuery } from '@apollo/client';
import {
  AdvancedTransactionQueryOptions,
  FilterType,
  TransactionClassification,
} from 'src/__generated__/graphql';
import { IBasicAccount } from 'src/components/tables/BasicTransactionTable';

const getAggregatedTransactionsQuery = gql(`
query advancedTransactionQuery($options:AdvancedTransactionQueryOptions!) {
  advancedTransactionQuery(options:$options) {
    classification
    description
    month
    tags {
      name
    }
  	totalDepositCents
    totalExpenseCents
    transactionCount
    transactionIds
  }
}`);

const tagsQuery = gql(`
query getTags {
  tags {
    name
  }
}`);

const accountsQuery = gql(`
query getAccounts {
  getAccounts {
    id
    name
  }
}`);

export default function ChartBuilder() {
  const { themeStretch } = useSettingsContext();

  const [getAggregatedTransactions, getAggregatedTransactionsResults] = useLazyQuery(
    getAggregatedTransactionsQuery
  );

  const [queryOptions, setQueryOptions] = useState<AdvancedTransactionQueryOptions | null>(null);

  useEffect(() => {
    if (queryOptions !== null) {
      getAggregatedTransactions({
        variables: {
          options: queryOptions,
        },
      });
    }
  }, [getAggregatedTransactions, queryOptions]);

  useEffect(() => {
    setQueryOptions({
      aggregation: { tags: true, classification: true },
      includeFilters: {
        tags: {
          type: FilterType.Any,
          tags: ['Apple'],
        },
      },
      excludeFilters: {
        tags: {
          type: FilterType.Any,
          tags: ['Trash', 'Water'],
        },
        classifications: {
          classifications: [TransactionClassification.Expense],
        },
      },
    });
  }, []);

  // filter
  const [tags, setTags] = useState<string[]>([]);
  const [getTags, getTagsResult] = useLazyQuery(tagsQuery);

  const [accounts, setAccounts] = useState<IBasicAccount[]>([]);
  const [getAccounts, getAccountsResult] = useLazyQuery(accountsQuery);

  useEffect(() => {
    getTags();
    getAccounts();
  }, [getTags, getAccounts]);

  useEffect(() => {
    setTags(Object.values(getTagsResult?.data?.tags ?? {}).map((t) => t.name));
    setAccounts(getAccountsResult.data?.getAccounts as IBasicAccount[]);
  }, [getTagsResult, getAccountsResult]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<IBasicAccount[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<
    TransactionClassification[]
  >([]);

  useEffect(() => {
    setQueryOptions({
      aggregation: { tags: true, classification: true },
      includeFilters: {
        tags: {
          type: FilterType.Any,
          tags: selectedTags ?? [],
        },
        classifications: {
          classifications: selectedClassifications,
        },
        accounts: {
          accountIds: selectedAccounts.map((a) => a.id),
        },
      },
      excludeFilters: {},
    });
  }, [selectedTags, selectedAccounts, selectedClassifications]);

  return (
    <>
      <Helmet>
        <title>Transaction: Chartify</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction Charts
        </Typography>

        <Card sx={{ marginBottom: 2 }}>
          <Stack
            spacing={2}
            alignItems="center"
            direction={{
              xs: 'column',
              md: 'row',
            }}
            sx={{ px: 2.5, py: 3 }}
          >
            <Autocomplete
              sx={{ width: '400px' }}
              multiple
              onChange={(event, newValue) => setSelectedTags(newValue)}
              options={tags.map((option) => option)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    size="small"
                    label={option}
                    sx={{ marginRight: 1, borderRadius: 1 }}
                  />
                ))
              }
              renderInput={(params) => <TextField label="Tags" {...params} />}
            />

            <Autocomplete
              sx={{ width: '400px' }}
              multiple
              onChange={(event, newValue) =>
                setSelectedClassifications(newValue as TransactionClassification[])
              }
              options={(
                Object.keys(TransactionClassification) as Array<
                  keyof typeof TransactionClassification
                >
              ).map((option) => option)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    size="small"
                    label={option}
                    sx={{ marginRight: 1, borderRadius: 1 }}
                    color={
                      (option === 'Expense' && 'error') ||
                      (option === 'Income' && 'success') ||
                      (option === 'Duplicate' && 'secondary') ||
                      (option === 'Recurring' && 'warning') ||
                      (option === 'Transfer' && 'secondary') ||
                      (option === 'Investment' && 'primary') ||
                      (option === 'Hidden' && 'secondary') ||
                      'default'
                    }
                  />
                ))
              }
              renderInput={(params) => <TextField label="Classifications" {...params} />}
            />

            <Autocomplete
              sx={{ width: 1 }}
              multiple
              onChange={(event, newValue) => setSelectedAccounts(newValue as IBasicAccount[])}
              options={(accounts ?? []).map((account) => account)}
              getOptionLabel={(option: IBasicAccount) => option.name}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    size="small"
                    label={option.name}
                    sx={{ marginRight: 1, borderRadius: 1 }}
                  />
                ))
              }
              renderInput={(params) => <TextField label="Accounts" {...params} />}
            />
          </Stack>
        </Card>

        <pre>
          {JSON.stringify(getAggregatedTransactionsResults.data?.advancedTransactionQuery, null, 2)}
        </pre>
      </Container>
    </>
  );
}
