import React, { useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import FilterTransactionsView from "../components/views/FilterTransactionsView";
import { Account } from "../common/types";
import { useQuery } from "@apollo/client";
import { getAllTags } from "../graphql/types/getAllTags";
import Queries from "../graphql/Queries";
import { getAllAccounts } from "../graphql/types/getAllAccounts";
import { RichQueryFilter } from "../graphql/graphql-global-types";
import { getFilteredTransactions } from "../graphql/types/getFilteredTransactions";
import { TransactionGrid } from "../components/grids";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 30,
      paddingTop: 80,
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
    },
  })
);

export default function TransactionsTwo() {
  const classes = useStyles();
  const [filterOptions, setFilterOptions] = useState<RichQueryFilter>({
    excludeTransfers: true,
  });

  const tagsResult = useQuery<getAllTags>(Queries.GET_ALL_TAGS);
  const accountsResult = useQuery<getAllAccounts>(Queries.GET_ALL_ACCOUNTS);
  const { data, loading } = useQuery<getFilteredTransactions>(
    Queries.GET_FILTERED_TRANSACTIONS,
    {
      variables: {
        options: {
          where: filterOptions,
        },
      },
    }
  );

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <Paper className={classes.paper}>
            <FilterTransactionsView
              tagOptions={tagsResult.data?.tags ?? []}
              accountOptions={
                (accountsResult.data?.allAccounts as Account[]) ?? []
              }
              onChange={setFilterOptions}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12}>
          <TransactionGrid
            transactions={
              data?.getFilteredTransactions.map((ft) => {
                return { ...ft, date: new Date(Number(ft.date)) };
              }) ?? []
            }
            showTags={true}
          />
        </Grid>
      </Grid>
    </div>
  );
}
