import { alpha } from '@mui/material';
import { Theme } from '@mui/material/styles/createTheme';
import { ApexOptions } from 'apexcharts';
import { IBasicTransaction } from 'src/components/tables/BasicTransactionTable';

// this is a subtype of ApexAxisChartSeries
export type ApexData = {
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

export function getEmptyMonthlySeries(first: number, last: number): { [key: number]: 0 } {
  let series: { [key: number]: 0 } = {};
  let date = new Date(first);

  while (date.getTime() <= last) {
    series[date.getTime()] = 0;
    date.setMonth(date.getMonth() + 1);
  }

  return series;
}

export function getTimeWindowCutoffTime(timeWindow: string): number {
  let date = new Date();
  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);
  date.setHours(0);

  switch (timeWindow) {
    case 'Year To Date':
      date.setDate(1);
      date.setMonth(0);
      return date.getTime();
    case '1 Year':
      date.setMonth(date.getMonth() - 12);
      return date.getTime();
    case 'All':
    default:
      return 0;
  }
}

export function getSeriesFromTransactions(
  transactions: IBasicTransaction[],
  timeWindow: string,
  invert: boolean,
  smoothing: boolean
) {
  let cutoffTime = getTimeWindowCutoffTime(timeWindow ?? 'All');
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

      memo[date.getTime()] += invert ? t.amountCents * -1 : t.amountCents;
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
    let value = smoothing
      ? [
          aggregatedData[Number(months[i])] ?? 0,
          aggregatedData[Number(months[i - 1])] ?? 0,
          aggregatedData[Number(months[i - 2])] ?? 0,
        ].reduce((memo, x) => memo + x, 0) / 3
      : aggregatedData[Number(k)] ?? 0;

    if (Number(k) >= cutoffTime) {
      series[0].data.push({ x: Number(k), y: value });
    }
  });

  return series as ApexAxisChartSeries;
}

export function useChart(theme: Theme, options?: ApexOptions) {
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
      size: 6,
      strokeColors: theme.palette.background.paper,
    },

    // Tooltip
    tooltip: {
      x: {
        show: false,
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
