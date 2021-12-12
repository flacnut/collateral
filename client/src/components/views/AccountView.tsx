import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";
import { getAllAccounts_allAccounts } from "../../graphql/types/getAllAccounts";
import OutlinedGroup from "../OutlinedGroup";

type Props = {
  account: getAllAccounts_allAccounts | null;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: 20,
      padding: 0,
    },
    option: {
      height: 19,
    },
    accountField: {
      margin: 8,
      minWidth: 180,
    },
  })
);

function getDate(dateStr: string | null | undefined): string {
  if (dateStr == null) {
    return "";
  }

  return new Date(Number(dateStr)).toLocaleDateString();
}

export default function AccountView(props: Props) {
  const classes = useStyles();

  return (
    <Container className={classes.container}>
      <OutlinedGroup id="account-group" label="Account">
        <Grid container>
          <Grid item container xs={12}>
            <Grid item xs={4} sm={3} className={classes.accountField}>
              <OutlinedGroup label="Name" id="account-name-group">
                <div className={classes.option}>
                  {props.account?.accountName ?? ""}
                </div>
              </OutlinedGroup>
            </Grid>
            <Grid item xs={4} sm={3} className={classes.accountField}>
              <OutlinedGroup label="Institution" id="account-institution-group">
                <div className={classes.option}>
                  {props.account?.institution ?? ""}
                </div>
              </OutlinedGroup>
            </Grid>
            <Grid item xs={4} sm={3} className={classes.accountField}>
              <OutlinedGroup label="Number" id="account-number-group">
                <div className={classes.option}>
                  {props.account?.accountNumber ?? ""}
                </div>
              </OutlinedGroup>
            </Grid>
            <Grid item xs={4} sm={3} className={classes.accountField}>
              <OutlinedGroup label="Latest Balance" id="account-balance-group">
                <div className={classes.option}>
                  {props.account?.latestBalance?.balanceCents ?? "unknown"}
                </div>
              </OutlinedGroup>
            </Grid>
            <Grid item xs={4} sm={3} className={classes.accountField}>
              <OutlinedGroup
                label="Latest Transaction"
                id="account-transaction-group"
              >
                <div className={classes.option}>
                  {getDate(props.account?.latestTransaction?.date)}
                </div>
              </OutlinedGroup>
            </Grid>
          </Grid>
        </Grid>
      </OutlinedGroup>
    </Container>
  );
}
