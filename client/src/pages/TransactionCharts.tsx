import { useQuery } from '@apollo/client';
import { Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from 'src/components/settings';
import { gql } from 'src/__generated__';

const getAggregatedTransactionsQuery = gql(`
query getAggregatedTransactions($options: QueryAggregationOptions!) {
  getAggregatedTransactions(options:$options) {
    description
    month
    classification
    totalExpenseCents
    totalDepositCents
    transactionCount
    transactionIds
  }
}`);

export default function TransactionCharts() {
  const { themeStretch } = useSettingsContext();
  const { data } = useQuery(getAggregatedTransactionsQuery, {
    variables: {
      options: {
        month: true,
        classification: true,
      },
    },
  });

  const expenses = data?.getAggregatedTransactions
    .map((at) => {
      return {
        amount: (at.totalExpenseCents * -1 + at.totalDepositCents) / 100,
        month: at.month,
        classification: at.classification,
      };
    })
    .filter((t) => t.classification === 'expense');
  console.dir(expenses);

  return (
    <>
      <Helmet>
        <title>Transaction: Chartify</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction Charts
        </Typography>
      </Container>
    </>
  );
}
