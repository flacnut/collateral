import React, { useMemo } from "react";
import Highcharts from "highcharts";
import VariablePie from "highcharts/modules/variable-pie";
import HighchartsReact from "highcharts-react-official";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { SeriesData } from "./index";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 30,
      paddingTop: 80,
    },
    "root #credits": {
      backgroundColor: "red",
    },
  })
);

type Props = {
  series?: SeriesData[];
  groupedSeries?: Array<{
    groupName: string;
    series: SeriesData[];
  }>;
  backgroundColor: string;
};

VariablePie(Highcharts);

export default function Pie(props: Props) {
  const seriesToHighchartsData = (series: SeriesData) => {
    return {
      name: series.name,
      color: series.color,
      y: series.amountCents,
      z: series.transactionCount,
    };
  };

  const classes = useStyles();
  const data = useMemo(() => {
    return [
      {
        innerSize: "40%",
        data: props.series
          ? props.series.map(seriesToHighchartsData)
          : props.groupedSeries
              ?.map((gs) => gs.series.map(seriesToHighchartsData))
              .flat(),
      },
    ];
  }, [props.series, props.groupedSeries]);

  if (!props.series && !props.groupedSeries) {
    return null;
  }

  const options = {
    chart: {
      type: "variablepie",
      backgroundColor: props.backgroundColor,
    },
    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
        "Area (square km): <b>{point.y}</b><br/>" +
        "Population density (people per square km): <b>{point.z}</b><br/>",
    },
    series: data,
  };

  return (
    <HighchartsReact
      className={classes.root}
      highcharts={Highcharts}
      options={options}
    />
  );
}
