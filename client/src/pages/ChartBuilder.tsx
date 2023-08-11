import React, { useCallback, useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  Card,
  CardHeader,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Theme,
  Typography,
  useTheme,
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
import {
  AggregatedTransactionTable,
  Color,
  IAggregatedTransaction,
} from 'src/components/tables/AggregatedTransactionTable';
import Iconify from 'src/components/iconify';
import Chart from 'src/components/charts/Chart';
import { ApexOptions } from 'apexcharts';
import numeral from 'numeral';
import { useChart } from 'src/utils/chartUtils';

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

type ISeriesConfig = {
  tags: string[];
  color?: string;
  name?: string;
};

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

  const [aggTransactions, setAggTransactions] = useState<IAggregatedTransaction[]>([]);
  const [seriesConfig, setSeriesConfig] = useState<ISeriesConfig[]>([]);

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

  useEffect(() => {
    setAggTransactions(
      (getAggregatedTransactionsResults.data?.advancedTransactionQuery ?? [])
        .map((at, i) => {
          if (!at.month) {
            console.log('NO MONTH!');
            console.dir(at);
          }
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
        .filter((t) => t !== null)
    );
  }, [getAggregatedTransactionsResults.data, setAggTransactions]);

  const colorIndex = [
    'primary',
    'secondary',
    'error',
    'info',
    'success',
    'warning',
  ] as Array<Color>;

  const getTagColor = useCallback(
    (transaction: IAggregatedTransaction, tag: string): Color => {
      let transactionTagNames = transaction.tags.map((t) => t.name);

      // match the transaction to the series definition
      const possibleMatches = seriesConfig
        .map((config, index) => {
          if (config.tags.every((configTag) => transactionTagNames.indexOf(configTag) !== -1)) {
            // only color the tags that specifically match series config
            if (config.tags.indexOf(tag) !== -1) {
              return colorIndex[index];
            }
          }
          return null;
        })
        .filter((c) => c !== null) as Array<Color>;

      // return first match
      return possibleMatches.length > 0 ? possibleMatches[0] : 'default';
    },
    [seriesConfig]
  );

  return (
    <>
      <Helmet>
        <title>Transaction: Chartify</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction Charts
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AdvancedTransactionFilters
              accounts={accounts}
              tags={tags}
              setQueryOptions={setQueryOptions}
            />
          </Grid>

          <Grid item xs={6}>
            <Card sx={{ marginBottom: 2 }}>
              <AggregatedTransactionTable
                transactions={ReAggregateIgnoreMonth(aggTransactions)}
                getTagColor={getTagColor}
              />
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card sx={{ marginBottom: 2 }}>
              <SeriesBuilder
                tags={tags}
                seriesConfig={seriesConfig}
                setSeriesConfig={setSeriesConfig}
              />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ marginBottom: 2 }}>
              <AggTransactionsChart
                aggTransactions={aggTransactions}
                onSelectedTransactions={() => {}}
                seriesConfig={seriesConfig}
              />
            </Card>
          </Grid>
        </Grid>

        <pre>
          {JSON.stringify(getAggregatedTransactionsResults.data?.advancedTransactionQuery, null, 2)}
        </pre>
      </Container>
    </>
  );
}

function SeriesBuilder(props: {
  tags: string[];
  seriesConfig: ISeriesConfig[];
  setSeriesConfig: (isc: ISeriesConfig[]) => void;
}) {
  const { tags, seriesConfig, setSeriesConfig } = props;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const appendConfig = useCallback(() => {
    let tags = selectedTags;
    setSelectedTags([]);
    setSeriesConfig([...seriesConfig, { tags }]);
  }, [setSeriesConfig, setSelectedTags, selectedTags, seriesConfig]);

  const deleteItem = useCallback(
    (i: number) => {
      seriesConfig.splice(i, 1);
      setSeriesConfig([...seriesConfig]);
    },
    [seriesConfig, setSeriesConfig]
  );

  return (
    <>
      {seriesConfig.map((sc, i) => (
        <Stack
          key={i}
          spacing={2}
          alignItems="center"
          direction={{
            xs: 'column',
            md: 'row',
          }}
          sx={{ px: 2.5, paddingTop: 3 }}
        >
          <Chip
            size={'small'}
            color="error"
            label="X"
            sx={{ marginRight: 1, borderRadius: 1 }}
            onClick={() => deleteItem(i)}
          />
          <span>
            {sc.tags.map((tag, index) => (
              <Chip
                key={index}
                size={'small'}
                label={tag}
                sx={{ marginRight: 1, borderRadius: 1 }}
              />
            ))}
          </span>
        </Stack>
      ))}

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
          value={selectedTags}
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
        <Button variant="contained" onClick={appendConfig} size="large" disabled={false}>
          <Iconify icon="eva:plus-outline" />
        </Button>
      </Stack>
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
      aggregation: { tags: true, classification: true, month: true },
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

function ReAggregateIgnoreMonth(
  aggTransactions: IAggregatedTransaction[]
): IAggregatedTransaction[] {
  let reducedMap = aggTransactions.reduce(
    (set: { [key: string]: IAggregatedTransaction }, at: IAggregatedTransaction) => {
      let key =
        at.classification +
        '::' +
        at.tags
          .map((t) => t.name)
          .sort()
          .join('_');

      if (set[key]) {
        set[key].transactionIds = [...set[key].transactionIds, ...at.transactionIds];
        set[key].count += at.count;
        set[key].amountCents += at.amountCents;
        set[key].amount += at.amount;
      } else {
        set[key] = JSON.parse(JSON.stringify(at));
        set[key].date = new Date(0);
      }

      return set;
    },
    {}
  );

  return Object.values(reducedMap);
}

// CHART FROM ACCOUNTVIEW
function AggTransactionsChart(props: {
  aggTransactions: IAggregatedTransaction[];
  seriesConfig: ISeriesConfig[];
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

  // reset when input changes to prevent page thrash
  useEffect(() => {
    setTimeWindow('year to date');
  }, [props.aggTransactions, setTimeWindow]);

  const theme = useTheme();
  const chartOptions = useChart(theme, {}) as ApexOptions;
  const { timeData, groups, seriesNames } = getSeriesData(
    timeWindow,
    props.aggTransactions,
    props.seriesConfig
  );

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
        let aggTransactionSet = props.aggTransactions.filter(
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
          Transactions
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

function getSeriesData(
  duration: string,
  at: IAggregatedTransaction[],
  seriesConfig: ISeriesConfig[]
) {
  const getSeriesKey = (at: IAggregatedTransaction): string => {
    if (!at.tags || at.tags.length === 0) {
      return '';
    }

    let atTagNams = at.tags.map((t) => t.name);

    for (let i = 0; i < seriesConfig.length; i++) {
      let containsAll = seriesConfig[i].tags
        .map((st) => atTagNams.indexOf(st) >= 0)
        .every((r) => r);
      if (containsAll) {
        return seriesConfig[i].tags.sort().join('::');
      }
    }
    return 'other';
  };

  const years: { [year: string]: number } = {};
  const dates: {
    [date: string]: { [classification: string]: { count: number; amountCents: number } };
  } = {};
  const groupKeys = at.reduce((memo: string[], t) => {
    if (memo.indexOf(getSeriesKey(t)) !== -1) return memo;
    memo.push(getSeriesKey(t));
    return memo;
  }, []);

  getDates(duration, at).forEach((time) => {
    dates[time] = groupKeys.reduce(
      (memo: { [key: string]: { count: number; amountCents: number } }, k) => {
        memo[k] = { count: 0, amountCents: 0 };
        return memo;
      },
      {}
    );
  });

  at.forEach((t) => {
    let time = t.date.getTime();
    let key = getSeriesKey(t);

    if (!dates[time]) {
      return;
    }
    dates[time][key].amountCents += t.amountCents;
    dates[time][key].count += t.count;
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
