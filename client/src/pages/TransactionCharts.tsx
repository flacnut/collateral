import { useLazyQuery } from '@apollo/client';
import {
  alpha,
  Box,
  Button,
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
  color?: ColorSchema;
  smoothing?: boolean;
  invert?: boolean;
}

type ApexData = {
  x: any;
  y: any;
  fill?: ApexFill;
  fillColor?: string;
  strokeColor?: string;
  meta?: any;
  goals?: any;
  barHeightOffset?: number;
  columnWidthOffset?: number;
};

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
    setSeries(getSeriesFromTransactions(transactions));
  }, [transactions, props.smoothing]);

  let getEmptyMonthlySeries = (first: number, last: number): { [key: number]: 0 } => {
    let series: { [key: number]: 0 } = {};
    let date = new Date(first);

    while (date.getTime() <= last) {
      series[date.getTime()] = 0;
      date.setMonth(date.getMonth() + 1);
    }

    return series;
  };

  let getSeriesFromTransactions = (transactions: IBasicTransaction[]) => {
    let date = new Date();
    date.setDate(1);

    const aggregatedData = transactions.reduce(
      (memo: { [key: number]: number }, t: IBasicTransaction) => {
        let tdate = new Date(t.date);
        date.setMonth(tdate.getMonth());
        date.setFullYear(tdate.getFullYear());

        if (!memo[date.getTime()]) {
          memo[date.getTime()] = 0;
        }

        memo[date.getTime()] += props.invert ? t.amountCents * -1 : t.amountCents;
        return memo;
      },
      {}
    );

    let dates = Object.keys(aggregatedData).sort();
    let series: { data: ApexData[] }[] = [{ data: [] }];
    let months = Object.keys(
      getEmptyMonthlySeries(Number(dates[0]), Number(dates[dates.length - 1]))
    ).sort();

    months.forEach((k, i) => {
      let value = props.smoothing
        ? [
            aggregatedData[Number(months[i])] ?? 0,
            aggregatedData[Number(months[i - 1])] ?? 0,
            aggregatedData[Number(months[i - 2])] ?? 0,
          ].reduce((memo, x) => memo + x, 0) / 3
        : aggregatedData[Number(k)] ?? 0;
      series[0].data.push({ x: Number(k), y: value });
    });

    return series as ApexAxisChartSeries;
  };

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
        formatter: (value: number) => fCurrency(value / 100),
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

        <Typography variant="h3">{fCurrency(thisMonth / 100)}</Typography>

        <TrendingInfo percent={changePct} />
      </Stack>

      <Chart type="area" series={series} options={chartOptions as ApexOptions} height={120} />
    </Card>
  );
}

// ----------------------------------------------------------------------

type TrendingInfoProps = {
  percent: number;
};

function TrendingInfo({ percent }: TrendingInfoProps) {
  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={0.5}>
      <Iconify icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'} />

      <Typography variant="subtitle2" component="span">
        {percent > 0 && '+'}

        {fPercent(percent)}

        <Box component="span" sx={{ opacity: 0.72, typography: 'body2' }}>
          {' than last month'}
        </Box>
      </Typography>
    </Stack>
  );
}

function useChart(options?: ApexOptions) {
  const theme = useTheme();

  const LABEL_TOTAL = {
    show: true,
    label: 'Total',
    color: theme.palette.text.secondary,
    fontSize: theme.typography.subtitle2.fontSize as string,
    fontWeight: theme.typography.subtitle2.fontWeight,
    lineHeight: theme.typography.subtitle2.lineHeight,
  };

  const LABEL_VALUE = {
    offsetY: 8,
    color: theme.palette.text.primary,
    fontSize: theme.typography.h3.fontSize as string,
    fontWeight: theme.typography.h3.fontWeight,
    lineHeight: theme.typography.h3.lineHeight,
  };

  const baseOptions = {
    // Colors
    colors: [
      theme.palette.primary.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
      theme.palette.success.main,
      theme.palette.warning.dark,
      theme.palette.success.darker,
      theme.palette.info.dark,
      theme.palette.info.darker,
    ],

    // Chart
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      // animations: { enabled: false },
      foreColor: theme.palette.text.disabled,
      fontFamily: theme.typography.fontFamily,
    },

    // States
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.04,
        },
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.88,
        },
      },
    },

    // Fill
    fill: {
      opacity: 1,
      gradient: {
        type: 'vertical',
        shadeIntensity: 0,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100],
      },
    },

    // Datalabels
    dataLabels: { enabled: false },

    // Stroke
    stroke: {
      width: 3,
      curve: 'smooth',
      lineCap: 'round',
    },

    // Grid
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
    },

    // Xaxis
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    // Markers
    markers: {
      size: 0,
      strokeColors: theme.palette.background.paper,
    },

    // Tooltip
    tooltip: {
      x: {
        show: false,
      },
    },

    // Legend
    legend: {
      show: true,
      fontSize: String(13),
      position: 'top',
      horizontalAlign: 'right',
      markers: {
        radius: 12,
      },
      fontWeight: 500,
      itemMargin: { horizontal: 12 },
      labels: {
        colors: theme.palette.text.primary,
      },
    },

    // plotOptions
    plotOptions: {
      // Bar
      bar: {
        borderRadius: 4,
        columnWidth: '28%',
      },

      // Pie + Donut
      pie: {
        donut: {
          labels: {
            show: true,
            value: LABEL_VALUE,
            total: LABEL_TOTAL,
          },
        },
      },

      // Radialbar
      radialBar: {
        track: {
          strokeWidth: '100%',
          background: alpha(theme.palette.grey[500], 0.16),
        },
        dataLabels: {
          value: LABEL_VALUE,
          total: LABEL_TOTAL,
        },
      },

      // Radar
      radar: {
        polygons: {
          fill: { colors: ['transparent'] },
          strokeColors: theme.palette.divider,
          connectorColors: theme.palette.divider,
        },
      },

      // polarArea
      polarArea: {
        rings: {
          strokeColor: theme.palette.divider,
        },
        spokes: {
          connectorColors: theme.palette.divider,
        },
      },
    },

    // Responsive
    responsive: [
      {
        // sm
        breakpoint: theme.breakpoints.values.sm,
        options: {
          plotOptions: { bar: { columnWidth: '40%' } },
        },
      },
      {
        // md
        breakpoint: theme.breakpoints.values.md,
        options: {
          plotOptions: { bar: { columnWidth: '32%' } },
        },
      },
    ],
  };

  return { ...baseOptions, ...options };
}
