import React, { useEffect, useState } from "react";
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
import CommunicationStayCurrentLandscape from "material-ui/svg-icons/communication/stay-current-landscape";

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

  const dateTimeData = transactions
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

  const [tagFilters, setTagFilters] = useState<Tag[]>([]);
  const [
    getTransactions,
    { data, error, loading },
  ] = useLazyQuery<getTransactionsByTags>(Queries.GET_TRANSACTIONS_ONLY_BY_TAG);

  useEffect(() => {
    getTransactions({
      variables: {
        tags: tagFilters.map((t) => t.tag),
      },
    });
  }, [tagFilters, getTransactions]);

  const options = {
    chart: {
      type: "spline",
    },
    title: {
      text: "My chart",
    },
    xAxis: {
      type: "datetime",
    },
    series: [
      {
        data: groupDataByMonth(data?.transactionsByTags ?? []),
      },
    ],
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
                  onChange={(tf: Tag[]) => setTagFilters(tf)}
                />
              </Grid>
            </Grid>
          </OutlinedGroup>
        </Grid>
        <Grid item>
          {loading ? <pre>loading...</pre> : null}
          {error ? (
            <>
              <pre>{JSON.stringify(error).toString()}</pre>
              <pre>{error.message}</pre>
            </>
          ) : null}
        </Grid>
        <Grid item className={classes.table}>
          <TransactionGrid
            showTags={false}
            transactions={
              data?.transactionsByTags?.map((t) => {
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

function TagsFilter(props: { label: string; onChange: (tags: Tag[]) => void }) {
  const { data } = useQuery<getAllTags>(Queries.GET_ALL_TAGS);
  return (
    <div>
      <TagMultiSelector
        label={props.label}
        onChange={props.onChange}
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
