import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../components/settings';
import { useParams } from 'react-router';
import { useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { gql } from 'src/__generated__/gql';
import { IAggregatedTransaction } from 'src/components/tables/AggregatedTransactionTable';

// ----------------------------------------------------------------------

const getAccountQuery = gql(`
query getAccount($accountId: String!) {
  getAccount(accountId: $accountId) {
    name
    officialName
    status
    type
    latestTransaction {
      id
      amount
      amountCents
      classification
      date
      description
      tags {
        name
      }
    }
    latestBalance {
      availableCents
      balanceCents
      lastUpdateDate
      limitCents
    }
    institution {
      logo
      primaryColor
      name
    }
  }
}`);

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

export default function AccountView() {
  const { themeStretch } = useSettingsContext();

  const { id } = useParams<string>();
  const [refetch, { data, loading }] = useLazyQuery(getAccountQuery);

  const [refetchTransactionVolume, transactionVolumeResults] = useLazyQuery(
    getAggregatedTransactionsQuery
  );

  useEffect(() => {
    !!id &&
      refetch({
        variables: {
          accountId: id,
        },
      });

    !!id &&
      refetchTransactionVolume({
        variables: {
          options: {
            aggregation: { month: true, classification: true },
            includeFilters: {
              accounts: {
                accountIds: [id],
              },
            },
            excludeFilters: {},
          },
        },
      });
  }, [id]);

  const [aggTransactions, setAggTransactions] = useState<IAggregatedTransaction[]>([]);
  useEffect(() => {
    setAggTransactions(
      (transactionVolumeResults.data?.advancedTransactionQuery ?? []).map((at, i) => {
        return {
          key: i.toString(),
          accountId: '',
          tags: at.tags ?? [],
          transactionIds: at.transactionIds ?? [],
          description: at.description ?? '',
          amountCents: at.totalDepositCents - at.totalExpenseCents,
          amount: (at.totalDepositCents - at.totalExpenseCents) / 100,
          currency: null,
          classification: at.classification ?? '',
          account: { id: '', name: '' },
          count: at.transactionCount,
          date: new Date(at.month ?? 0),
        };
      })
    );
  }, [transactionVolumeResults.data, setAggTransactions]);

  return (
    <>
      <Helmet>
        <title>Account</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Account
        </Typography>

        <Typography gutterBottom>
          <pre>{JSON.stringify(data?.getAccount, null, 2)}</pre>
        </Typography>

        <Typography gutterBottom>
          <pre>{JSON.stringify(aggTransactions, null, 2)}</pre>
        </Typography>
      </Container>
    </>
  );
}
