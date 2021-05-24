import React, { useState } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import TagMultiSelector from "../components/input/TagMultiSelector";
import Queries from "../graphql/Queries";
import { getAllTags } from "../graphql/types/getAllTags";
import { Grid } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import OutlinedGroup from "../components/OutlinedGroup";
import { TransactionGrid } from "../components/grids";
import {
  getTransactionsByTags,
  getTransactionsByTags_transactionsByTags,
} from "../graphql/types/getTransactionsByTags";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    body: {
      padding: 30,
      paddingTop: 80,
    },
    table: {
      maxHeight: 400,
      overflowY: "auto",
    },
  })
);

type SeriesData = {
  [key: string]: {
    series: Array<[number, number]>;
    transactions: getTransactionsByTags_transactionsByTags[];
  };
};

type Tag = {
  id: number;
  tag: string;
};

function groupDataByMonth(
  transactions: getTransactionsByTags_transactionsByTags[]
): Array<[number, number]> {
  if (!transactions) {
    return [];
  }
  const monthData: { [key: string]: number } = {};

  transactions
    .map((t) => {
      return {
        time: new Date(t.date),
        amountCents: t.amountCents,
      };
    })
    .forEach((current) => {
      const monthGroup = `${current.time.getFullYear()}-${
        current.time.getMonth() + 1
      }`;
      if (!monthData[monthGroup]) {
        monthData[monthGroup] = current.amountCents;
      } else {
        monthData[monthGroup] += current.amountCents;
      }
    });

  return Object.keys(monthData)
    .map((key) => {
      return { time: new Date(key).getTime(), amount: monthData[key] / 100 };
    })
    .sort((a, b) => a.time - b.time)
    .map((t) => [t.time, t.amount]);
}

export default function Charts() {
  const classes = useStyles();
  const [series, setSeries] = useState<SeriesData>({});

  const options = {
    chart: {
      type: "column",
    },
    title: {
      text: "My chart",
    },
    xAxis: {
      type: "datetime",
    },
    series: Object.keys(series).map((seriesName) => {
      return { name: seriesName, data: series[seriesName].series };
    }),
    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: {
          enabled: false,
        },
      },
      series: {
        cursor: "pointer",
        point: {
          events: {
            click: function (event: { point: { x: number; y: number } }) {
              console.dir(event.point.x);
              console.dir(event.point.y);
            },
          },
        },
      },
    },
  };

  return (
    <Grid container className={classes.body}>
      <Grid item container xs={12} direction="column" spacing={2}>
        <Grid item>
          <OutlinedGroup id={"seriesGroup"} label={"Series"}>
            <Grid item container xs={12} spacing={2}>
              <Grid item xs={6}>
                <TagsFilter
                  label={"Select Tags"}
                  onChange={(s: SeriesData) => {
                    setSeries({ ...series, ...s });
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TagsFilter
                  label={"Select Tags"}
                  onChange={(s: SeriesData) => {
                    setSeries({ ...series, ...s });
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TagsFilter
                  label={"Select Tags"}
                  onChange={(s: SeriesData) => {
                    setSeries({ ...series, ...s });
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TagsFilter
                  label={"Select Tags"}
                  onChange={(s: SeriesData) => {
                    setSeries({ ...series, ...s });
                  }}
                />
              </Grid>
            </Grid>
          </OutlinedGroup>
        </Grid>
        <Grid item className={classes.table}>
          <TransactionGrid
            showTags={false}
            transactions={
              Object.keys(series)
                .map((seriesName) => series[seriesName].transactions)
                .flat()
                .map((t) => {
                  return {
                    id: t.id,
                    date: t.date ?? "",
                    originalDescription: t.originalDescription,
                    friendlyDescription: t.friendlyDescription,
                    amount: t.amountCents / 100,
                    tags: [],
                  };
                }) ?? []
            }
          />
        </Grid>

        <Grid item>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </Grid>
      </Grid>
    </Grid>
  );
}

function TagsFilter(props: {
  label: string;
  onChange: (series: SeriesData) => void;
}) {
  const { data } = useQuery<getAllTags>(Queries.GET_ALL_TAGS);
  const [tags, setTags] = useState<Tag[]>([]);
  const [getTransactions] = useLazyQuery<getTransactionsByTags>(
    Queries.GET_TRANSACTIONS_ONLY_BY_TAG,
    {
      onCompleted: (data) => {
        props.onChange({
          [tags.map((t) => t.tag).join("::")]: {
            series: groupDataByMonth(data?.transactionsByTags ?? []),
            transactions: data?.transactionsByTags,
          },
        });
      },
    }
  );

  return (
    <div>
      <TagMultiSelector
        label={props.label}
        onChange={(tf: Tag[]) => {
          setTags(tf);
          getTransactions({
            variables: {
              tags: tf.map((t) => t.tag),
            },
          });
        }}
        tags={
          data?.tags
            ? data.tags.map((t) => {
                return {
                  id: t.id,
                  tag: t.tag,
                };
              })
            : []
        }
      />
    </div>
  );
}
