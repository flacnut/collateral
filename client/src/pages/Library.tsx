import React, { useState } from "react";
import {
  makeStyles,
  createStyles,
  Theme,
  useTheme,
} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import TagAutoComplete from "../components/input/TagAutoComplete";
import FilterTransactionsView from "../components/views/FilterTransactionsView";
import { Account, Transaction } from "../common/types";
import { TransactionDataGrid, TransactionGrid } from "../components/grids";
import { PieChart } from "../components/charts";
import CreateSeriesView from "../components/views/CreateSeriesView";
import { getAllTags } from "../graphql/types/getAllTags";
import Queries from "../graphql/Queries";
import { useQuery } from "@apollo/client";
import { getAllAccounts } from "../graphql/types/getAllAccounts";

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
      { id: 10, tag: "transfer" },
      { id: 21, tag: "cc-payment" },
    ],
  },
  {
    id: 47,
    date: new Date("2020-02-27T08:00:00.000Z"),
    amountCents: 192374,
    originalDescription:
      "Deposit Shared Branch Mobile Deposit          First Tech FC CA",
    friendlyDescription: null,
    tags: [{ id: 10, tag: "transfer" }],
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
    tags: [{ id: 4, tag: "expense" }],
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

const twoDeePiechartData = [
  {
    name: "amazon",
    amountCents: 23142,
    transactionCount: 3,
  },
  {
    name: "haggen",
    amountCents: 46683,
    transactionCount: 4,
  },
  {
    name: "apple",
    amountCents: 10899,
    transactionCount: 12,
  },
  {
    name: "pse",
    amountCents: 10823,
    transactionCount: 7,
  },
  {
    name: "pcc",
    amountCents: 32688,
    transactionCount: 2,
  },
];

const groupedSeriesData = [
  {
    groupName: "groceries",
    series: [
      {
        name: "Haggen",
        amountCents: 4683,
        color: "#44E668",
      },
      {
        name: "PCC",
        amountCents: 12688,
        color: "#00C98A",
      },
      {
        name: "QFC",
        amountCents: 11888,
        color: "#00A99A",
      },
    ],
  },
  {
    groupName: "bills",
    series: [
      {
        name: "PSE",
        amountCents: 13102,
        color: "#0e87fa",
      },
      {
        name: "Ziply",
        amountCents: 8000,
        color: "#3f52b1",
      },
      {
        name: "Water",
        amountCents: 4550,
        color: "#37216b",
      },
      {
        name: "HOA",
        amountCents: 3000,
        color: "#2c094b",
      },
    ],
  },
  {
    groupName: "subscriptions",
    series: [
      {
        name: "Spotify",
        amountCents: 1550,
        color: "#fcfe64",
      },
      {
        name: "Netflix",
        amountCents: 1700,
        color: "#f7e14a",
      },
      {
        name: "HBO",
        amountCents: 2099,
        color: "#f0c533",
      },
      {
        name: "iCloud",
        amountCents: 1299,
        color: "#e8a91f",
      },
      {
        name: "News",
        amountCents: 399,
        color: "#dd8d0c",
      },
    ],
  },
];

export default function Library() {
  const classes = useStyles();
  const [selection, setSelection] = useState<{
    transactions: number[];
    allRowsSelected: boolean;
  }>({
    transactions: [],
    allRowsSelected: false,
  });

  const theme = useTheme();
  const tagsResult = useQuery<getAllTags>(Queries.GET_ALL_TAGS);
  const accountsResult = useQuery<getAllAccounts>(Queries.GET_ALL_ACCOUNTS);

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <Paper className={classes.paper}>
            <PieChart
              series={twoDeePiechartData}
              backgroundColor={theme.palette.background.paper}
            />
            <PieChart
              groupedSeries={groupedSeriesData}
              backgroundColor={theme.palette.background.paper}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <TagAutoComplete
            id="tags-autocomplete-example"
            options={exampleTags}
            onChange={(t) => {}}
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
              onChange={(filterOptions) => {}}
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
            onSelectionChanged={setSelection}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <pre>{JSON.stringify(selection, null, 2)}</pre>
        </Grid>

        {/* TODO: NOOOOOOOO - NO SAMPLE DATA!*/}
        <Grid item xs={12} sm={12}>
          <Paper className={classes.paper}>
            <CreateSeriesView
              tagOptions={tagsResult.data?.tags ?? []}
              accountOptions={
                (accountsResult.data?.allAccounts as Account[]) ?? []
              }
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
