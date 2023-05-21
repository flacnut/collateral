import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from 'src/components/settings';

import { gql } from 'src/__generated__';
import { useLazyQuery } from '@apollo/client';
import {
  AdvancedTransactionQueryOptions,
  FilterType,
  TransactionClassification,
} from 'src/__generated__/graphql';

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

  return (
    <>
      <Helmet>
        <title>Transaction: Chartify</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction Charts
        </Typography>

        <pre>
          {JSON.stringify(getAggregatedTransactionsResults.data?.advancedTransactionQuery, null, 2)}
        </pre>
      </Container>
    </>
  );
}
