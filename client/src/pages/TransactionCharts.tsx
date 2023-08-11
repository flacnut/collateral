import { useLazyQuery } from '@apollo/client';
import {
  Box,
  Card,
  CardProps,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Helmet } from 'react-helmet-async';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { ColorSchema } from 'src/theme/palette';
import { fCurrency, fPercent } from 'src/utils/formatNumber';
import { gql } from 'src/__generated__';
import { useCallback, useEffect, useState } from 'react';
import { IBasicTransaction } from 'src/components/tables/BasicTransactionTable';
import { TransactionClassification } from 'src/__generated__/graphql';
import { ApexData, getSeriesFromTransactions } from 'src/utils/chartUtils';

const getTransactionsByTagsQuery = gql(`
query getTransactionsByTags($tags:[String!]!, $classifications:[TransactionClassification!]) {
  getTransactionsByTags(classifications:$classifications, tags:$tags) {
    key
    transactions {
			...CoreParts
      account {
        id
        name
      }
    }
  }
}

fragment CoreParts on CoreTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
  tags {
    name
	}
}`);

export default function TransactionCharts() {
  const { themeStretch } = useSettingsContext();

  const [safe, setSafe] = useState(false);
  const onChangeSafe = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSafe(event.target.checked);
    },
    [setSafe]
  );

  const [smoothing, setSmoothing] = useState(false);
  const onChangeSmoothing = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSmoothing(event.target.checked);
    },
    [setSmoothing]
  );

  const [timeWindow, setTimeWindow] = useState('All');
  const handleModifyTimeWindow = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTimeWindow(event.target.value);
    },
    [setTimeWindow]
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
            <TextField
              fullWidth
              select
              label="Duration"
              value={timeWindow}
              onChange={handleModifyTimeWindow}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { maxHeight: 240 },
                  },
                },
              }}
              sx={{
                maxWidth: { md: '250px' },
                textTransform: 'capitalize',
              }}
            >
              {['Year To Date', '1 Year', 'All'].map((option) => (
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
              label="Safe"
              control={<Switch checked={safe} onChange={onChangeSafe} />}
              sx={{
                pl: 2,
                py: 1.5,
                top: 0,
              }}
            />

            <FormControlLabel
              label="Smoothing"
              control={<Switch checked={smoothing} onChange={onChangeSmoothing} />}
              sx={{
                pl: 2,
                py: 1.5,
                top: 0,
              }}
            />
          </Stack>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <TransactionSummaryWidget
              title="Income"
              color="success"
              tags={['Salary']}
              classifications={[TransactionClassification.Income]}
              smoothing={smoothing}
              safe={safe}
              timeWindow={timeWindow}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TransactionSummaryWidget
              title="Petrol"
              color="info"
              tags={['Petrol']}
              classifications={[TransactionClassification.Expense]}
              invert={true}
              smoothing={smoothing}
              safe={safe}
              timeWindow={timeWindow}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TransactionSummaryWidget
              title="Restaurant"
              color="warning"
              tags={['Restaurant']}
              classifications={[TransactionClassification.Expense]}
              invert={true}
              smoothing={smoothing}
              safe={safe}
              timeWindow={timeWindow}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TransactionSummaryWidget
              title="Groceries"
              color="warning"
              tags={['Groceries']}
              classifications={[TransactionClassification.Expense]}
              invert={true}
              smoothing={smoothing}
              safe={safe}
              timeWindow={timeWindow}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TransactionSummaryWidget
              title="Water"
              color="warning"
              tags={['Water']}
              classifications={[TransactionClassification.Recurring]}
              invert={true}
              smoothing={smoothing}
              safe={safe}
              timeWindow={timeWindow}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TransactionSummaryWidget
              title="Energy"
              color="warning"
              tags={['Energy']}
              classifications={[TransactionClassification.Recurring]}
              invert={true}
              smoothing={smoothing}
              safe={safe}
              timeWindow={timeWindow}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

interface WidgetProps extends CardProps {
  title: string;
  tags: string[];
  classifications: TransactionClassification[];
  safe: boolean;

  color?: ColorSchema;
  smoothing?: boolean;
  invert?: boolean;
  timeWindow?: string;
}

function TransactionSummaryWidget(props: WidgetProps) {
  const color = props.color ?? 'primary';
  const [getTransactions, getTransactionsResponse] = useLazyQuery(getTransactionsByTagsQuery);
  const [transactions, setTransactions] = useState<IBasicTransaction[]>([]);
  const [series, setSeries] = useState<ApexAxisChartSeries>([]);

  useEffect(() => {
    getTransactions({
      variables: {
        tags: props.tags,
        classifications: props.classifications,
      },
    });
  }, [getTransactions, props.tags, props.classifications]);

  useEffect(() => {
    setTransactions(
      getTransactionsResponse.data?.getTransactionsByTags.reduce(
        (memo: IBasicTransaction[], gt) => {
          return [...memo, ...(gt.transactions as unknown as IBasicTransaction[])];
        },
        []
      ) ?? []
    );
  }, [getTransactionsResponse]);

  useEffect(() => {
    setSeries(
      getSeriesFromTransactions(
        transactions,
        props.timeWindow ?? 'All',
        !!props.invert,
        !!props.smoothing
      )
    );
  }, [transactions, props.smoothing]);

  const theme = useTheme();
  const chartOptions = {
    colors: [theme.palette[color].main],
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: { show: false },
    },
    yaxis: {
      labels: { show: false },
      min: 0,
    },
    stroke: {
      width: 4,
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: 'topRight',
      },
      marker: { show: false },
      y: {
        formatter: (value: number) => (props.safe ? '$ X,XXX.XX' : fCurrency(value / 100)),
        title: {
          formatter: () => '',
        },
      },
      x: {
        formatter: (value: number) =>
          new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.56,
        opacityTo: 0.56,
      },
    },
  };

  const thisMonth =
    series.length > 0 && series[0].data?.length > 2
      ? (series[0].data[series[0].data.length - 1] as ApexData).y
      : 0;
  const lastMonth =
    series.length > 0 && series[0].data?.length > 2
      ? (series[0].data[series[0].data.length - 2] as ApexData).y
      : 0;
  const changePct = (thisMonth * 100) / lastMonth - 100;

  const avg =
    series[0] && series[0].data
      ? (series[0].data as ApexData[]).reduce((memo, ad) => memo + ad.y, 0) / series[0].data.length
      : 0;

  const avgPct = (thisMonth * 100) / avg - 100;

  return (
    <Card
      sx={{
        width: 1,
        boxShadow: 0,
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => theme.palette[color].lighter,
        ...props.sx,
      }}
      {...props}
    >
      <Iconify
        icon={
          props.invert ? 'eva:diagonal-arrow-right-up-fill' : 'eva:diagonal-arrow-left-down-fill'
        }
        sx={{
          p: 1.5,
          top: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          position: 'absolute',
          color: (theme) => theme.palette[color].lighter,
          bgcolor: (theme) => theme.palette[color].dark,
        }}
      />

      <Stack spacing={1} sx={{ p: 3 }}>
        <Typography variant="subtitle2">{props.title}</Typography>

        <Typography variant="h3">
          {props.safe ? '$ X,XXX.XX' : fCurrency(thisMonth / 100)}
        </Typography>

        <TrendingInfo percent={changePct} compareTo={'last month'} />
        <TrendingInfo percent={avgPct} compareTo={'average'} />
      </Stack>

      <Chart type="area" series={series} options={chartOptions as ApexOptions} height={140} />
    </Card>
  );
}

// ----------------------------------------------------------------------

interface TrendingInfoProps {
  percent: number;
  compareTo: string;
}

function TrendingInfo({ percent, compareTo }: TrendingInfoProps) {
  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={0.5}>
      <Iconify icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'} />

      <Typography variant="subtitle2" component="span">
        {percent > 0 && '+'}

        {fPercent(percent)}

        <Box component="span" sx={{ opacity: 0.72, typography: 'body2' }}>
          {' than ' + compareTo}
        </Box>
      </Typography>
    </Stack>
  );
}
