import { useQuery } from '@apollo/client';
import {
  alpha,
  Box,
  Card,
  CardProps,
  Container,
  Grid,
  Stack,
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
    .filter((t) => t.classification === 'expense')
    .map((at) => {
      return {
        amount: (at.totalExpenseCents * -1 + at.totalDepositCents) / 100,
        month: at.month ?? '',
        classification: at.classification,
      };
    })
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
    .reverse();

  const income = data?.getAggregatedTransactions
    .filter((t) => t.classification === 'income')
    .map((at) => {
      return {
        amount: (at.totalExpenseCents * -1 + at.totalDepositCents) / 100,
        month: at.month ?? '',
        classification: at.classification,
      };
    })
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
    .reverse();

  const recurring = data?.getAggregatedTransactions
    .filter((t) => t.classification === 'recurring')
    .map((at) => {
      return {
        amount: (at.totalExpenseCents * -1 + at.totalDepositCents) / 100,
        month: at.month ?? '',
        classification: at.classification,
      };
    })
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
    .reverse();

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
          <Grid item xs={12} sm={6} md={3}>
            <BankingWidgetSummary
              title="Income"
              icon="eva:diagonal-arrow-left-down-fill"
              percent={2.6}
              total={18765}
              chart={{
                series:
                  income?.map((e) => {
                    return { y: e.amount, x: e.month };
                  }) ?? [],
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <BankingWidgetSummary
              title="Expenses"
              color="error"
              icon="eva:diagonal-arrow-right-up-fill"
              percent={-0.5}
              total={8938}
              chart={{
                series:
                  expenses?.map((e) => {
                    return { y: e.amount * -1, x: e.month };
                  }) ?? [],
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <BankingWidgetSummary
              title="Recurring"
              color="warning"
              icon="eva:diagonal-arrow-right-up-fill"
              percent={-0.5}
              total={8938}
              chart={{
                series:
                  recurring?.map((e) => {
                    return { y: e.amount * -1, x: e.month };
                  }) ?? [],
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  percent: number;
  color?: ColorSchema;
  icon: string;
  chart: {
    series: number[] | { x: string; y: number }[];
    options?: ApexOptions;
  };
}

function BankingWidgetSummary({
  title,
  total,
  icon,
  percent,
  color = 'primary',
  chart,
  sx,
  ...other
}: Props) {
  const theme = useTheme();

  const { series, options } = chart;

  const chartOptions = useChart({
    colors: [theme.palette[color].main],
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    xaxis: {
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
      marker: { show: false },
      y: {
        formatter: (value: number) => fCurrency(value),
        title: {
          formatter: () => '',
        },
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.56,
        opacityTo: 0.56,
      },
    },
    ...options,
  });

  return (
    <Card
      sx={{
        width: 1,
        boxShadow: 0,
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => theme.palette[color].lighter,
        ...sx,
      }}
      {...other}
    >
      <Iconify
        icon={icon}
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
        <Typography variant="subtitle2">{title}</Typography>

        <Typography variant="h3">{fCurrency(total)}</Typography>

        <TrendingInfo percent={percent} />
      </Stack>

      <Chart
        type="area"
        series={[{ data: series }]}
        options={chartOptions as ApexOptions}
        height={120}
      />
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
