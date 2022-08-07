import React, { useCallback, useMemo, useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import FilterTransactionsView from "../components/views/FilterTransactionsView";
import { Account, Tag, Transaction } from "../common/types";
import { useMutation, useQuery } from "@apollo/client";
import { getAllTags } from "../graphql/types/getAllTags";
import { updateTransactionTags } from "../graphql/types/updateTransactionTags";

import Queries from "../graphql/Queries";
import { getAllAccounts } from "../graphql/types/getAllAccounts";
import {
  RichQueryFilter,
  TransactionUpdateTagsInput,
} from "../graphql/graphql-global-types";
import { getFilteredTransactions, getFilteredTransactions_getFilteredTransactions } from "../graphql/types/getFilteredTransactions";
import { TransactionDataGrid } from "../components/grids";
import { createSingleTag } from "../graphql/types/createSingleTag";
import TagAutoComplete from "../components/input/TagAutoComplete";
import { Button } from "@material-ui/core";

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

  const [tagsToAdd, setTagsToAdd] = useState<Tag[]>([]);
  const [selection, setSelection] = useState<{
    transactions: number[];
    allRowsSelected: boolean;
  }>({
    transactions: [],
    allRowsSelected: false,
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

  const [createTag] = useMutation<createSingleTag>(Queries.CREATE_TAG);
  const [updateTransactionTags] = useMutation<updateTransactionTags>(
    Queries.UPDATE_TRANSACTION_TAGS
  );

  const transactionData = useMemo(() => {
    return (
      data?.getFilteredTransactions.map((ft) => {
        return { ...ft, date: new Date(Number(ft.date)) };
      }) ?? []
    );
  }, [data]);

  const groupedTransactionData = useMemo(() => {
    let groupedTransactions: { [key: string]: Transaction } = {};
    data?.getFilteredTransactions.forEach((ft) => {
      let key = ft.tags.map(t => t.id).sort().join('_');
      if (groupedTransactions[key]) {
        groupedTransactions[key].originalDescription = Number(groupedTransactions[key].originalDescription) + 1 + '';
        groupedTransactions[key].amountCents = groupedTransactions[key].amountCents + ft.amountCents;
      } else {
        groupedTransactions[key] = Object.assign({}, ft, { date: new Date(Number(ft.date)), originalDescription: 1 });
      }
    });
    console.dir(groupedTransactions);
    return groupedTransactions;
  }, [data]);


  const performSave = useCallback(async () => {
    const createdTags = (await Promise.all(
      tagsToAdd
        .filter((tag) => tag.id === -1)
        .map((tag) =>
          createTag({
            variables: { tag: tag.tag },
            refetchQueries: [{ query: Queries.GET_ALL_TAGS }],
          }).then((response) => response.data?.createTag)
        )
    )) as Tag[];

    const tagsToAddWithIds = tagsToAdd.map((tag) =>
      tag.id > -1 ? tag : createdTags.find((ct) => ct.tag === tag.tag)
    ) as Tag[];

    const updateData = selection.transactions.map((id) => {
      return {
        id,
        tags: tagsToAddWithIds.map((tag) => tag.id),
      } as TransactionUpdateTagsInput;
    });

    await updateTransactionTags({
      variables: { options: updateData },
      refetchQueries: [
        { query: Queries.GET_ALL_TAGS },
        {
          query: Queries.GET_FILTERED_TRANSACTIONS,
          variables: {
            options: {
              where: filterOptions,
            },
          },
        },
      ],
    });
  }, [
    createTag,
    filterOptions,
    selection.transactions,
    tagsToAdd,
    updateTransactionTags,
  ]);


  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

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
          <Paper className={classes.paper}>
            <TagAutoComplete
              id="tags-autocomplete-add"
              options={tagsResult?.data?.tags ?? []}
              onChange={setTagsToAdd}
              initialValue={tagsToAdd}
              variant="outlined"
              mode="edit"
            />
            <Button variant="contained" color="primary" onClick={performSave}>
              Save
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Paper className={classes.paper}>{formatter.format(transactionData.reduce((prev: number, current: { amountCents: number }) => { return prev + current.amountCents; }, 0) * 0.01)}</Paper>
        </Grid>
        <Grid item xs={12} sm={12}>
          <TransactionDataGrid
            loading={loading}
            transactions={Object.values(groupedTransactionData)}
            onSelectionChanged={setSelection}
            tags={tagsResult?.data?.tags ?? []}
            allowEdits={false}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TransactionDataGrid
            loading={loading}
            transactions={transactionData}
            onSelectionChanged={setSelection}
            tags={tagsResult?.data?.tags ?? []}
            allowEdits={false}
          />
        </Grid>
      </Grid>
    </div>
  );
}
