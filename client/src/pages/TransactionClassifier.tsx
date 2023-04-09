import { Helmet } from 'react-helmet-async';
// @mui
import { Button, Card, Container, Grid, Stack, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../components/settings';
import { gql } from 'src/__generated__/gql';
import { useLazyQuery } from '@apollo/client';
import { GetAggregatedTransactionsQuery } from 'src/__generated__/graphql';
import { useCallback, useEffect, useState } from 'react';
import { fCurrency } from 'src/utils/formatNumber';

// ----------------------------------------------------------------------

const unclassifiedTransactionsQuery = gql(`
query getAggregatedTransactions($options: QueryAggregationOptions!) {
  getAggregatedTransactions(options:$options) {
    description
    totalExpenseCents
    totalDepositCents
    transactionCount
    transactionIds
  }
}`);

const transactionsByIdQuery = gql(`
query getTransactionsbyId($ids:[String!]!) {
  getTransactionsById(ids:$ids) {
  
  __typename
  	...on Transaction {
      ...CoreTransactionParts
      tags {
        name
      }
    }
    ...on BackfilledTransaction {
      ...CoreBackfilledTransactionParts
      tags {
        name
      }
    }
    ... on InvestmentTransaction {
      ...CoreInvestmentTransactionParts
      tags {
        name
      }
    }
  }
}

fragment CoreTransactionParts on Transaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}

fragment CoreBackfilledTransactionParts on BackfilledTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}

fragment CoreInvestmentTransactionParts on InvestmentTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}`);

export default function TransactionClassifier() {
  const { themeStretch } = useSettingsContext();
  const [resultIndex, setResultIndex] = useState<number>(-1);
  const [unclassifiedTransactions, setUnclassifiedTransactions] = useState<
    GetAggregatedTransactionsQuery['getAggregatedTransactions']
  >([]);

  const [refetchUnclassified, unclassifiedResponse] = useLazyQuery(unclassifiedTransactionsQuery);
  const [refetchByIds, getByIdsResponse] = useLazyQuery(transactionsByIdQuery);

  useEffect(() => {
    if (!(unclassifiedResponse?.data?.getAggregatedTransactions || unclassifiedResponse?.loading)) {
      refetchUnclassified({
        variables: {
          options: {
            description: true,
            unclassifiedOnly: true,
          },
        },
      });
    }
  });

  useEffect(() => {
    const aggregateResponse = unclassifiedResponse?.data?.getAggregatedTransactions ?? [];
    if (aggregateResponse.length > 0) {
      setUnclassifiedTransactions(aggregateResponse);
      setResultIndex(0);
    }
  }, [unclassifiedResponse?.data, setResultIndex]);

  useEffect(() => {
    if (resultIndex === -1) {
      return;
    }
    refetchByIds({
      variables: {
        ids: unclassifiedTransactions[resultIndex].transactionIds,
      },
    });
  }, [resultIndex, refetchByIds, unclassifiedTransactions]);

  const prev = useCallback(() => {
    setResultIndex(Math.max(resultIndex - 1, 0));
  }, [setResultIndex, resultIndex]);

  const next = useCallback(() => {
    setResultIndex(Math.min(resultIndex + 1, unclassifiedTransactions.length - 1));
  }, [setResultIndex, resultIndex, unclassifiedTransactions]);

  return (
    <>
      <Helmet>
        <title>Transaction: Classify</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction: Classify
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
            <Button variant="contained" onClick={prev} size="large">
              Previous
            </Button>
            <Button variant="contained" onClick={next} size="large">
              Next
            </Button>
          </Stack>
        </Card>

        <TransactionView {...getAggregatedSet(unclassifiedTransactions ?? [], resultIndex)} />
      </Container>
    </>
  );

  function TransactionView(props: {
    description: string;
    totalExpenseCents: number;
    totalDepositCents: number;
    transactionCount: number;
    transactionIds: string[];
  }) {
    return (
      <>
        <Card sx={{ pt: 5, px: 5 }}>
          <Grid container>
            <Grid item xs={8} sm={9} sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ display: 'inline-flex', marginLeft: 3 }}>
                {`(${props.transactionCount}) ${props.description}`}
              </Typography>
            </Grid>

            <Grid item xs={4} sm={3} sx={{ mb: 5, textAlign: 'right' }}>
              {props.totalDepositCents > 0 ? (
                <Typography
                  variant="h5"
                  sx={{ display: 'inline-flex', marginLeft: 3 }}
                  color={'#36B37E'}
                >
                  {/* TODO: CENTS!!!! */}
                  {fCurrency(props.totalDepositCents / 100)}
                </Typography>
              ) : null}
              {props.totalExpenseCents > 0 ? (
                <Typography
                  variant="h5"
                  sx={{ display: 'inline-flex', marginLeft: 3 }}
                  color={'#FF5630'}
                >
                  {/* TODO: CENTS!!!! */}
                  {fCurrency(props.totalExpenseCents / 100)}
                </Typography>
              ) : null}
            </Grid>
          </Grid>
        </Card>
      </>
    );
  }
}

function getAggregatedSet(
  data: GetAggregatedTransactionsQuery['getAggregatedTransactions'],
  index: number
): {
  description: string;
  totalExpenseCents: number;
  totalDepositCents: number;
  transactionCount: number;
  transactionIds: string[];
} {
  if (!data[index]) {
    return {
      description: '',
      totalExpenseCents: 0,
      totalDepositCents: 0,
      transactionCount: 0,
      transactionIds: [],
    };
  }

  return {
    description: data[index].description ?? '',
    totalDepositCents: data[index].totalDepositCents ?? 0,
    totalExpenseCents: data[index].totalExpenseCents ?? 0,
    transactionCount: data[index].transactionCount ?? 0,
    transactionIds: data[index].transactionIds ?? [],
  };
}
