import React from "react";
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
    table: {
      maxHeight: 400,
      overflowY: "auto",
    },
  })
);

type Props = {
  useTwoDimensions?: boolean;
  series: SeriesData;
  backgroundColor: string;
};

VariablePie(Highcharts);

export default function Pie(props: Props) {
  const classes = useStyles();

  const options = {
    chart: {
      type: "variablepie",
      backgroundColor: props.backgroundColor,
    },
    title: {
      text: "Countries compared by population density and total area.",
    },
    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
        "Area (square km): <b>{point.y}</b><br/>" +
        "Population density (people per square km): <b>{point.z}</b><br/>",
    },
    series: [
      {
        minPointSize: 10,
        innerSize: "20%",
        zMin: 0,
        name: "countries",
        data: [
          {
            name: "Spain",
            y: 505370,
            z: 92.9,
          },
          {
            name: "France",
            y: 551500,
            z: 118.7,
          },
          {
            name: "Poland",
            y: 312685,
            z: 124.6,
          },
          {
            name: "Czech Republic",
            y: 78867,
            z: 137.5,
          },
          {
            name: "Italy",
            y: 301340,
            z: 201.8,
          },
          {
            name: "Switzerland",
            y: 41277,
            z: 214.5,
          },
          {
            name: "Germany",
            y: 357022,
            z: 235.6,
          },
        ],
      },
    ],
  };

  return (
    <HighchartsReact
      className={classes.root}
      highcharts={Highcharts}
      options={options}
    />
  );
}
