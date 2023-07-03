import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography, useTheme } from '@mui/material';
// components
import { useSettingsContext } from '../components/settings';
import { useParams } from 'react-router';
import { DocumentNode, useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { gql } from 'src/__generated__/gql';
import { IAggregatedTransaction } from 'src/components/tables/AggregatedTransactionTable';
import { useChart } from 'src/utils/chartUtils';

import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { TransactionCategory, TransactionClassification } from 'src/__generated__/graphql';
import Queries from 'src/graphql/Queries';

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

const getTransactionsForAccountQuery = gql(`
query getTransactionsByAccount($accountId:String!) {
  getTransactions(accountId:$accountId) {
    __typename
  	...on Transaction {
      ...CoreTransactionParts
      account {
        name
      }
      tags {
        name
      }
    }
    ...on BackfilledTransaction {
      ...CoreBackfilledTransactionParts
      account {
        name
      }
      tags {
        name
      }
    }
    ... on InvestmentTransaction {
      ...CoreInvestmentTransactionParts
      account {
        name
      }
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

  const theme = useTheme();
  const chartOptions = useChart(theme, {}) as ApexOptions;
  const { timeData, groups, seriesNames } = getSeriesData(aggTransactions);

  let series: Array<{ name: string; data: number[] }> = seriesNames
    .filter((n) => n !== '')
    .map((name) => {
      return { name, data: [] };
    });
  Object.keys(timeData).forEach((time) => {
    series.forEach((serie) => {
      serie.data.push(timeData[time][serie.name]);
    });
  });

  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  chartOptions.xaxis = {
    type: 'category',
    categories: Object.keys(timeData).map((key) => {
      let d = new Date(Number(key));
      return months[d.getMonth()];
    }),
    tickPlacement: 'between',
    axisBorder: { show: false },
    axisTicks: { show: false },
    group: {
      groups: groups,
    },
  };

  if (chartOptions.chart) {
    chartOptions.chart.stacked = false;
  }

  return (
    <>
      <Helmet>
        <title>Account</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Account
        </Typography>

        <Chart type="line" series={series} options={chartOptions} height={364} />

        <Typography gutterBottom>
          <pre>{JSON.stringify(getSeriesData(aggTransactions), null, 2)}</pre>
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

function getSeriesData(at: IAggregatedTransaction[]) {
  const years: { [year: string]: number } = {};
  const dates: { [date: string]: { [classification: string]: number } } = {};
  const classifications = at.reduce((memo: { [key: string]: number }, at) => {
    memo[at.classification] = 0;
    return memo;
  }, {});

  getDates().forEach((time) => {
    dates[time] = { ...classifications };
  });

  at.forEach((t) => {
    let time = t.date.getTime();

    if (!dates[time]) {
      return;
    }
    dates[time][t.classification] = t.transactionIds.length;
  });

  Object.keys(dates).forEach((date) => {
    let d = new Date(Number(date));
    let year = d.getFullYear().toString();
    if (Object.keys(years).indexOf(year) === -1) {
      years[d.getFullYear()] = 0;
    }

    years[d.getFullYear()]++;
  });

  let groups = Object.keys(years).map((year) => {
    return { title: year, cols: years[year] };
  });

  let seriesNames = Object.keys(dates).reduce((memo: string[], date) => {
    return Object.keys(dates[date]).concat(memo);
  }, []);

  return { timeData: dates, groups, seriesNames: Array.from(new Set(seriesNames)) };
}

function getDates(): number[] {
  const date = new Date(new Date().toLocaleDateString());
  date.setDate(1);

  let results = [date.getTime()];

  for (var i = 0; i < 23; i++) {
    date.setMonth(date.getMonth() - 1);
    results.unshift(date.getTime());
  }

  return results;
}
