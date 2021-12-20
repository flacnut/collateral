import React from "react";
import { Container, Grid, Button } from "@material-ui/core";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { useMutation, useQuery } from "@apollo/client";
import Queries from "../graphql/Queries";
import { getAllAccounts } from "../graphql/types/getAllAccounts";
import { generateTransfers } from "../graphql/types/generateTransfers";
import { AccountsGrid } from "../components/grids";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    accountsRoot: {
      padding: 30,
      paddingTop: 80,
      flexGrow: 1,
      boxSizing: "border-box",
    },
    buttons: {
      paddingTop: theme.spacing(3),
    },
  })
);

export default function Accounts() {
  const classes = useStyles();
  const { data } = useQuery<getAllAccounts>(Queries.GET_ALL_ACCOUNTS);
  const [generateTransfers] = useMutation<generateTransfers>(
    Queries.GENERATE_TRANSFERS
  );

  const genTransfers = async () => {
    await generateTransfers({
      variables: {
        accountIds: data?.allAccounts.map((a) => a.id),
      },
      refetchQueries: [],
    });
  };

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
        <Grid item xs={12}>
          <AccountsGrid accounts={data?.allAccounts} />
        </Grid>

        <Grid item className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SwapHorizIcon />}
            onClick={genTransfers}
          >
            Detect Transfers
          </Button>
        </Grid>
      </Grid>
    </Container >
  );
}
