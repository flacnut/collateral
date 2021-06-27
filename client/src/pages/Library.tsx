import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import TagAutoComplete from "../components/input/TagAutoComplete";
import FilterTransactionsView from "../components/views/FilterTransactionsView";
import { Account, Transaction } from "../common/types";
import { TransactionDataGrid, TransactionGrid } from "../components/grids";

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

// example tags
const exampleTags = [
  { id: 1, tag: "salary", fixed: true },
  { id: 2, tag: "asset-purchase" },
  { id: 3, tag: "asset-sale" },
  { id: 4, tag: "expense", fixed: true },
  { id: 5, tag: "investment" },
  { id: 6, tag: "one-off" },
  { id: 7, tag: "income" },
  { id: 8, tag: "car" },
  { id: 9, tag: "fitness" },
  { id: 10, tag: "transfer" },
  { id: 11, tag: "Amazon" },
  { id: 12, tag: "QFC" },
  { id: 13, tag: "Groceries" },
  { id: 14, tag: "PCC" },
  { id: 15, tag: "Haggens" },
  { id: 16, tag: "Wholefoods" },
  { id: 17, tag: "MetropolitanMarket" },
  { id: 18, tag: "Yuliya", fixed: true },
  { id: 19, tag: "Adam", fixed: true },
  { id: 20, tag: "Costco" },
  { id: 21, tag: "cc-payment" },
];

enum Institutions {
  FIRST_TECH_FEDERAL = "First Tech Federal CU",
  FIDELITY = "Fidelity",
  CITIBANK = "Citi",
  CHASE = "Chase Bank",
  CAPITOL_ONE = "Capitol One",
}

// example accounts
const exampleAccounts: Account[] = [
  {
    id: 1,
    accountName: "Adam Checking",
    accountNumber: "*2612",
    institution: Institutions.FIRST_TECH_FEDERAL,
    latestBalance: null,
    latestTransaction: null,
  },
  {
    id: 2,
    accountName: "Adam Checking (new)",
    accountNumber: "*4508",
    institution: Institutions.FIRST_TECH_FEDERAL,
    latestBalance: null,
    latestTransaction: null,
  },
  {
    id: 3,
    accountName: "Adam Savings",
    accountNumber: "*2609",
    institution: Institutions.FIRST_TECH_FEDERAL,
    latestBalance: null,
    latestTransaction: null,
  },
  {
    id: 4,
    accountName: "Odessy Credit Card",
    accountNumber: "*8052",
    institution: Institutions.FIRST_TECH_FEDERAL,
    latestBalance: null,
    latestTransaction: null,
  },
  {
    id: 5,
    accountName: "Fidelity JWROS",
    accountNumber: "Z06297743",
    institution: Institutions.FIDELITY,
    latestBalance: null,
    latestTransaction: null,
  },
];

const exampleTransactions: Transaction[] = [
  {
    id: 45,
    date: new Date("2020-03-11T08:00:00.000Z"),
    amountCents: 800000,
    originalDescription: "Deposit Transfer From 12345",
    friendlyDescription: null,
    tags: [
      { id: 11, tag: "Transfer" },
      { id: 54, tag: "Deposit" },
    ],
  },
  {
    id: 47,
    date: new Date("2020-02-27T08:00:00.000Z"),
    amountCents: 192374,
    originalDescription:
      "Deposit Shared Branch Mobile Deposit          First Tech FC CA",
    friendlyDescription: null,
    tags: [{ id: 54, tag: "Deposit" }],
  },
  {
    id: 48,
    date: new Date("2020-01-31T08:00:00.000Z"),
    amountCents: 1,
    originalDescription: "Credit Dividend",
    friendlyDescription: null,
    tags: [],
  },
  {
    id: 49,
    date: new Date("2020-01-30T08:00:00.000Z"),
    amountCents: -954850,
    originalDescription: "REI",
    friendlyDescription: null,
    tags: [{ id: 32, tag: "Outdoors" }],
  },
  {
    id: 50,
    date: new Date("2020-01-29T08:00:00.000Z"),
    amountCents: 1000000,
    originalDescription: "Deposit Transfer From 5678",
    friendlyDescription: null,
    tags: [],
  },
];

export default function Library() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TagAutoComplete
            id="tags-autocomplete-example"
            options={exampleTags}
            onChange={(t) => console.dir(t)}
            initialValue={[
              { id: 4, tag: "expense" },
              { id: 19, tag: "Adam" },
              { id: 20, tag: "Costco" },
            ]}
            variant="outlined"
            mode="edit"
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Paper className={classes.paper}>
            <FilterTransactionsView
              tagOptions={exampleTags}
              accountOptions={exampleAccounts}
              onChange={(filterOptions) => console.dir(filterOptions)}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12}>
          <TransactionGrid transactions={exampleTransactions} showTags={true} />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TransactionDataGrid
            transactions={exampleTransactions}
            tags={exampleTags}
            allowEdits={false}
          />
        </Grid>
      </Grid>
    </div>
  );
}
