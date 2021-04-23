import React from "react";
import { Container, Grid } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";
import Queries from "../graphql/Queries";
import { getAllAccounts } from "../graphql/types/getAllAccounts";
import AccountView from "../components/views/AccountView";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    accountsRoot: {
      padding: 30,
      paddingTop: 80,
      flexGrow: 1,
      boxSizing: "border-box",
    },
  })
);

export default function Accounts() {
  const classes = useStyles();
  const { data } = useQuery<getAllAccounts>(Queries.GET_ALL_ACCOUNTS);

  if (!data?.allAccounts) {
    return (
      <Container className={classes.accountsRoot}>
        Loading accounts...
      </Container>
    );
  }

  return (
    <Container className={classes.accountsRoot}>
      <Grid container>
        {data?.allAccounts.map((account) => (
          <Grid item>
            <AccountView account={account} />
          </Grid>
        ))}
        <Grid item>{/* todo create account flow */}</Grid>
      </Grid>
    </Container>
  );
}
