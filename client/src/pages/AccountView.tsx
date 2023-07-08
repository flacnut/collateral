import { Helmet } from 'react-helmet-async';
// @mui
import {
  Card,
  Container,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
// components
import { useSettingsContext } from '../components/settings';
import { useParams } from 'react-router';
import { useLazyQuery } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { gql } from 'src/__generated__/gql';
import { IAggregatedTransaction } from 'src/components/tables/AggregatedTransactionTable';
import { useChart } from 'src/utils/chartUtils';
import { ApexOptions } from 'apexcharts';
import {
  BasicTransactionTable,
  IBasicAccount,
  IBasicTransaction,
} from 'src/components/tables/BasicTransactionTable';
import { CustomAvatar } from 'src/components/custom-avatar';
import Chart from 'src/components/charts/Chart';
import { TransactionClassification } from 'src/__generated__/graphql';
import { fCurrency } from 'src/utils/formatNumber';
import numeral from 'numeral';

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

const transactionsByIdQuery = gql(`
query getTransactionsbyId($ids:[String!]!) {
  getTransactionsById(ids:$ids) {
  
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

interface IInstitution {
  name: string;
  logo: string;
}

interface IAccount extends IBasicAccount {
  institution: IInstitution;
}

type ApexOptionsChartTypes =
  | 'line'
  | 'area'
  | 'bar'
  | 'pie'
  | 'donut'
  | 'radialBar'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'candlestick'
  | 'boxPlot'
  | 'radar'
  | 'polarArea'
  | 'rangeBar'
  | 'rangeArea'
  | 'treemap';

export default function AccountView() {
  const { themeStretch } = useSettingsContext();

  const { id } = useParams<string>();
  const [refetch, { data, loading }] = useLazyQuery(getAccountQuery);

  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);

  const [account, setAccount] = useState<IAccount | null>(null);
  useEffect(() => {
    setAccount((data?.getAccount as unknown as IAccount) ?? null);
  }, [data?.getAccount, setAccount]);

  useEffect(() => {
    !!id &&
      refetch({
        variables: {
          accountId: id,
        },
      });
  }, [id]);

  return (
    <>
      <Helmet>
        <title>Account: {account?.name ?? ''}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack sx={{ marginBottom: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CustomAvatar
              src={`data:image/png;base64,${account?.institution.logo}`}
              name={account?.institution.name}
            />
            <Typography variant="h3" component="h1" paragraph>
              {account?.name}
            </Typography>
          </Stack>
          <Typography noWrap variant="body2" sx={{ color: '#919eab', marginLeft: '58px' }}>
            {account?.institution.name}
          </Typography>
        </Stack>

        <Card sx={{ pb: 1, px: 3, marginBottom: 2 }}>
          <AccountTransactionsChart
            accountId={id ?? null}
            onSelectedTransactions={setSelectedTransactionIds}
          />
        </Card>

        <Card sx={{ marginBottom: 2 }}>
          <BasicTransactionTableViewById transactionIds={selectedTransactionIds} />
        </Card>

        <Card sx={{ marginBottom: 2 }}>
          <BasicTransactionTableView accountId={id ?? null} />
        </Card>
      </Container>
    </>
  );
}

function AccountTransactionsChart(props: {
  accountId: string | null;
  onSelectedTransactions: (transactionIds: string[]) => void;
}) {
  // toolbar
  const dataTypes = ['amount', 'volume'];
  const [dataType, setDataType] = useState<string>('amount');
  const onSelectDataType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataType(event.target.value);
  };

  const timeWindows = ['year to date', '1 year', '2 years', '3 years', '5 years', 'all'];
  const [timeWindow, setTimeWindow] = useState<string>('year to date');
  const onSelectTimeWindow = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTimeWindow(event.target.value);
  };

  const chartTypes = ['bar', 'line'];
  const [chartType, setChartType] = useState<ApexOptionsChartTypes>('bar');
  const onSelectChartType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChartType(event.target.value as ApexOptionsChartTypes);
  };

  const [stacked, setStacked] = useState(false);
  const onSetStacked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStacked(event.target.checked);
  };

  // chart data rendering
  const [refetchTransactionVolume, transactionVolumeResults] = useLazyQuery(
    getAggregatedTransactionsQuery
  );

  useEffect(() => {
    !!props.accountId &&
      refetchTransactionVolume({
        variables: {
          options: {
            aggregation: { month: true, classification: true },
            includeFilters: {
              accounts: {
                accountIds: [props.accountId],
              },
            },
            excludeFilters: {},
          },
        },
      });
  }, [props.accountId]);

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
  const { timeData, groups, seriesNames } = getSeriesData(timeWindow, aggTransactions);

  let getSerieValue = (serie: string, time: string): number => {
    switch (dataType) {
      case 'amount':
        return timeData[time][serie].amountCents / 100;
      case 'volume':
        return timeData[time][serie].count;
      default:
        return 0;
    }
  };

  let series: Array<{ name: string; color?: string; data: number[] }> = seriesNames
    .filter((n) => n !== '')
    .map((name) => {
      return { name, data: [] };
    });
  Object.keys(timeData).forEach((time) => {
    series.forEach((serie) => {
      serie.data.push(getSerieValue(serie.name, time));
    });
  });

  series.forEach((s) => {
    if (
      Object.keys(TransactionClassification)
        .map((k) => k.toLowerCase())
        .indexOf(s.name) !== -1
    ) {
      s.color = getColor(s.name, theme);
    }
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

  chartOptions.yaxis = (chartOptions.yaxis ?? {}) as ApexYAxis;
  chartOptions.yaxis.labels = {
    formatter: (val: number, opts?: any) => numeral(val).format('$0,0'),
  };

  if (chartOptions.chart) {
    chartOptions.chart.type = chartType;
    chartOptions.chart.stacked = stacked;

    chartOptions.chart.events = {
      dataPointSelection: function (
        event,
        chartContext,
        config: { seriesIndex: number; dataPointIndex: number }
      ) {
        let seriesTime = Number(Object.keys(timeData)[config.dataPointIndex]);
        let aggTransactionSet = aggTransactions.filter(
          (at) =>
            at.classification.toLowerCase() === series[config.seriesIndex].name.toLowerCase() &&
            seriesTime === at.date.getTime()
        );

        if (aggTransactionSet.length !== 1) {
          return;
        }

        props.onSelectedTransactions(aggTransactionSet.pop()?.transactionIds ?? []);
      },
    };
  }

  return (
    <Stack>
      <Stack
        spacing={2}
        alignItems="center"
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{ px: 2.5, py: 3 }}
      >
        <Typography variant="h4" component="div" flexGrow={1}>
          Account Transactions
        </Typography>
        <TextField
          fullWidth
          select
          label="Data"
          value={dataType}
          onChange={onSelectDataType}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: { maxHeight: 220 },
              },
            },
          }}
          sx={{
            maxWidth: { md: 200 },
            textTransform: 'capitalize',
          }}
        >
          {dataTypes.map((option) => (
            <MenuItem
              key={option}
              value={option}
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
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          select
          label="Duration"
          value={timeWindow}
          onChange={onSelectTimeWindow}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: { maxHeight: 220 },
              },
            },
          }}
          sx={{
            maxWidth: { md: 200 },
            textTransform: 'capitalize',
          }}
        >
          {timeWindows.map((option) => (
            <MenuItem
              key={option}
              value={option}
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
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          select
          label="Chart"
          value={chartType}
          onChange={onSelectChartType}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: { maxHeight: 220 },
              },
            },
          }}
          sx={{
            maxWidth: { md: 200 },
            textTransform: 'capitalize',
          }}
        >
          {chartTypes.map((option) => (
            <MenuItem
              key={option}
              value={option}
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
              {option}
            </MenuItem>
          ))}
        </TextField>

        <FormControlLabel
          label="Stacked"
          control={<Switch checked={stacked} onChange={onSetStacked} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
          }}
        />
      </Stack>
      <Chart series={series} options={chartOptions} height={300} />
    </Stack>
  );
}

function getColor(name: string, theme: Theme): string {
  switch (name) {
    case 'duplicate':
      return theme.palette.grey[300];
    case 'hidden':
      return theme.palette.info.light;
    case 'transfer':
      return theme.palette.info.main;
    case 'expense':
      return theme.palette.error.main;
    case 'recurring':
      return theme.palette.warning.main;
    case 'income':
      return theme.palette.success.main;
    case 'investment':
      return theme.palette.success.light;
    default:
      return '';
  }
}

function BasicTransactionTableView(props: { accountId: string | null }) {
  const [refetchByAccount, getByAccountResponse] = useLazyQuery(getTransactionsForAccountQuery);
  const [transactions, setTransactions] = useState<IBasicTransaction[]>([]);

  useEffect(() => {
    if (!props.accountId) {
      return;
    }

    refetchByAccount({
      variables: {
        accountId: props.accountId,
      },
    });
  }, [props.accountId, refetchByAccount]);

  useEffect(() => {
    let maybeTransactions = [...(getByAccountResponse.data?.getTransactions ?? [])];
    setTransactions(
      (maybeTransactions as unknown as IBasicTransaction[]).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  }, [getByAccountResponse.data]);

  return <BasicTransactionTable transactions={transactions} />;
}

function BasicTransactionTableViewById(props: { transactionIds: string[] }) {
  const [refetchByIds, getByIdsResponse] = useLazyQuery(transactionsByIdQuery);
  const [transactions, setTransactions] = useState<IBasicTransaction[]>([]);

  useEffect(() => {
    refetchByIds({
      variables: {
        ids: props.transactionIds,
      },
    });
  }, [props.transactionIds, refetchByIds]);

  useEffect(() => {
    let maybeTransactions = [...(getByIdsResponse.data?.getTransactionsById ?? [])];
    setTransactions(
      (maybeTransactions as unknown as IBasicTransaction[]).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  }, [getByIdsResponse.data]);

  return <BasicTransactionTable transactions={transactions} />;
}

function getSeriesData(duration: string, at: IAggregatedTransaction[]) {
  const years: { [year: string]: number } = {};
  const dates: {
    [date: string]: { [classification: string]: { count: number; amountCents: number } };
  } = {};
  const classifications = at.reduce(
    (memo: { [key: string]: { count: number; amountCents: number } }, at) => {
      memo[at.classification] = { count: 0, amountCents: 0 };
      return memo;
    },
    {}
  );

  getDates(duration, at).forEach((time) => {
    dates[time] = { ...classifications };
  });

  at.forEach((t) => {
    let time = t.date.getTime();

    if (!dates[time]) {
      return;
    }
    dates[time][t.classification] = { count: t.transactionIds.length, amountCents: t.amountCents };
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

function getDates(duration: string, at: IAggregatedTransaction[]): number[] {
  const date = new Date(new Date().toLocaleDateString());
  date.setDate(1);

  let results = [date.getTime()];
  let months = getDuration(duration, at);

  for (var i = 0; i < months; i++) {
    date.setMonth(date.getMonth() - 1);
    results.unshift(date.getTime());
  }

  return results;
}

function getDuration(duration: string, at: IAggregatedTransaction[]): number {
  const now = new Date();
  switch (duration) {
    case '1 year':
      return 11;
    case '2 years':
      return 23;
    case '3 years':
      return 35;
    case '5 years':
      return 59;
    case 'year to date':
      return now.getMonth();
    case 'all':
      let oldestDate = at.reduce((memo: Date, transaction) => {
        return transaction.date.getTime() < memo.getTime() ? transaction.date : memo;
      }, now);

      let months = (now.getFullYear() - oldestDate.getFullYear()) * 12;
      months -= oldestDate.getMonth();
      months += now.getMonth();
      return months <= 0 ? 0 : months;
    default:
      return 1;
  }
}
