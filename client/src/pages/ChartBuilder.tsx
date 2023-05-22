import React, { useCallback, useEffect, useState } from 'react';
import {
  Autocomplete,
  Card,
  CardHeader,
  Chip,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
    setTags(
      Object.values(getTagsResult?.data?.tags ?? {})
        .map((t) => t.name)
        .sort()
    );
    setAccounts(getAccountsResult.data?.getAccounts as IBasicAccount[]);
  }, [getTagsResult, getAccountsResult]);

  return (
    <>
      <Helmet>
        <title>Transaction: Chartify</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction Charts
        </Typography>

        <AdvancedTransactionFilters
          accounts={accounts}
          tags={tags}
          setQueryOptions={setQueryOptions}
        />

        <pre>
          {JSON.stringify(getAggregatedTransactionsResults.data?.advancedTransactionQuery, null, 2)}
        </pre>
      </Container>
    </>
  );
}

function AdvancedTransactionFilters(props: {
  accounts: IBasicAccount[];
  tags: string[];
  setQueryOptions: (options: AdvancedTransactionQueryOptions) => void;
}) {
  const { tags, accounts } = props;

  const [selectedTagFilterType, setSelectedTagFilterType] = useState<FilterType>(FilterType.Any);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<IBasicAccount[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<
    TransactionClassification[]
  >([]);

  const [excludedTagFilterType, setExcludedTagFilterType] = useState<FilterType>(FilterType.Any);
  const [excludedTags, setExcludedTags] = useState<string[]>([]);
  const [excludedAccounts, setExcludedAccounts] = useState<IBasicAccount[]>([]);
  const [excludedClassifications, setExcludedClassifications] = useState<
    TransactionClassification[]
  >([]);

  const handleSetTagFilterType = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedTagFilterType(event.target.value as FilterType);
    },
    [setSelectedTagFilterType]
  );

  const handleSetExcludedTagFilterType = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setExcludedTagFilterType(event.target.value as FilterType);
    },
    [setExcludedTagFilterType]
  );

  useEffect(() => {
    props.setQueryOptions({
      aggregation: { tags: true, classification: true },
      includeFilters: {
        tags: {
          type: selectedTagFilterType,
          tags: selectedTags ?? [],
        },
        classifications: {
          classifications: selectedClassifications,
        },
        accounts: {
          accountIds: selectedAccounts.map((a) => a.id),
        },
      },
      excludeFilters: {
        tags: {
          type: excludedTagFilterType,
          tags: excludedTags ?? [],
        },
        classifications: {
          classifications: selectedClassifications.length > 0 ? [] : excludedClassifications,
        },
        accounts: {
          accountIds: selectedAccounts.length > 0 ? [] : excludedAccounts.map((a) => a.id),
        },
      },
    });
  }, [
    selectedTags,
    selectedAccounts,
    selectedClassifications,
    selectedTagFilterType,
    excludedTags,
    excludedAccounts,
    excludedClassifications,
    excludedTagFilterType,
  ]);

  return (
    <Card sx={{ marginBottom: 2 }}>
      <CardHeader title="Filter" />
      <Stack
        spacing={2}
        alignItems="center"
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{ px: 2.5, paddingTop: 3 }}
      >
        <Autocomplete
          sx={{ width: '500px' }}
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

        <TextField
          fullWidth
          select
          label="Tags"
          value={selectedTagFilterType}
          onChange={handleSetTagFilterType}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: { maxHeight: 220 },
              },
            },
          }}
          sx={{
            maxWidth: { md: 100 },
            textTransform: 'capitalize',
          }}
        >
          <MenuItem
            key={FilterType.Any}
            value={FilterType.Any}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
              '&:first-of-type': { mt: 0 },
              '&:last-of-type': { mb: 0 },
            }}
          >
            Any
          </MenuItem>

          <MenuItem
            key={FilterType.All}
            value={FilterType.All}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
              '&:first-of-type': { mt: 0 },
              '&:last-of-type': { mb: 0 },
            }}
          >
            All
          </MenuItem>
        </TextField>

        <Autocomplete
          sx={{ width: '500px' }}
          multiple
          onChange={(event, newValue) =>
            setSelectedClassifications(newValue as TransactionClassification[])
          }
          options={(
            Object.keys(TransactionClassification) as Array<keyof typeof TransactionClassification>
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
          sx={{ width: '500px' }}
          multiple
          onChange={(event, newValue) => setExcludedTags(newValue)}
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
          renderInput={(params) => <TextField label="Exclude Tags" {...params} />}
        />

        <TextField
          fullWidth
          select
          label="Tags"
          value={excludedTagFilterType}
          onChange={handleSetExcludedTagFilterType}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: { maxHeight: 220 },
              },
            },
          }}
          sx={{
            maxWidth: { md: 100 },
            textTransform: 'capitalize',
          }}
        >
          <MenuItem
            key={FilterType.Any}
            value={FilterType.Any}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
              '&:first-of-type': { mt: 0 },
              '&:last-of-type': { mb: 0 },
            }}
          >
            Any
          </MenuItem>

          <MenuItem
            key={FilterType.All}
            value={FilterType.All}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
              '&:first-of-type': { mt: 0 },
              '&:last-of-type': { mb: 0 },
            }}
          >
            All
          </MenuItem>
        </TextField>

        <Autocomplete
          disabled={selectedClassifications.length > 0}
          sx={{ width: '500px' }}
          multiple
          onChange={(event, newValue) =>
            setExcludedClassifications(newValue as TransactionClassification[])
          }
          options={(
            Object.keys(TransactionClassification) as Array<keyof typeof TransactionClassification>
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
          renderInput={(params) => <TextField label="Exclude Classifications" {...params} />}
        />

        <Autocomplete
          disabled={selectedAccounts.length > 0}
          sx={{ width: 1 }}
          multiple
          onChange={(event, newValue) => setExcludedAccounts(newValue as IBasicAccount[])}
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
          renderInput={(params) => <TextField label="Exclude Accounts" {...params} />}
        />
      </Stack>
    </Card>
  );
}
