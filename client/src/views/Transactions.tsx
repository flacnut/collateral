import React from "react";
import { useQuery } from "@apollo/client";
import { SelectableTransactionGrid } from "../components/grids";
import TagMultiSelector from "../components/input/TagMultiSelector";
import Queries from "../graphql/Queries";
import { getAllTransactions } from "../graphql/types/getAllTransactions";
import { getAllTags } from "../graphql/types/getAllTags";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
    },
    body: {
      padding: 30,
      paddingTop: 75,
    },
  })
);

export default function Transactions() {
  const classes = useStyles();

  return (
    <Grid container className={classes.body}>
      <Grid item container xs={12} direction="column">
        <Grid item>
          <TagsFilter />
        </Grid>
        <Grid item>
          <TransactionsGrid />
        </Grid>
      </Grid>
    </Grid>
  );
}

function TagsFilter() {
  const { data } = useQuery<getAllTags>(Queries.GET_ALL_TAGS);
  return (
    <div>
      <TagMultiSelector
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

function TransactionsGrid() {
  const { data, loading, error } = useQuery<getAllTransactions>(
    Queries.GET_ALL_TRANSACTIONS
  );

  return loading ? (
    <div>Loading....</div>
  ) : error ? (
    <>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </>
  ) : (
    <SelectableTransactionGrid
      rows={
        data?.transactions
          ? data.transactions.map((t: any) => {
              return {
                id: t.id,
                date: t.date ?? "",
                originalDescription: t.originalDescription,
                friendlyDescription: t.friendlyDescription,
                amount: t.amountCents / 100,
                tags: t.tags.map((tg: any) => tg.tag).join(", "),
              };
            })
          : []
      }
    />
  );
}
