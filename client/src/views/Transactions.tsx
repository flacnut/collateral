import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { SelectableTransactionGrid } from "../components/grids";
import TagMultiSelector from "../components/input/TagMultiSelector";
import Queries from "../graphql/Queries";
import { getAllTransactions } from "../graphql/types/getAllTransactions";
import { getAllTags } from "../graphql/types/getAllTags";
import { updateTransactionTags } from "../graphql/types/updateTransactionTags";
import { TextField, Grid } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import OutlinedGroup from "../components/OutlinedGroup";

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
      paddingTop: 80,
    },
    inputGroup: {
      padding: 30,
    },
    textField: {
      width: "100%",
    },
  })
);

type Tag = {
  id: number;
  tag: string;
};

export default function Transactions() {
  const classes = useStyles();

  const [tagFilters, setTagFilters] = useState<Tag[]>([]);
  const [tagsToAdd, setTagsToAdd] = useState<Tag[]>([]);
  const [descriptionFilter, setDescriptionFilters] = useState("");
  const [selectedTransactionIds, setSelectedTransactions] = useState<number[]>(
    []
  );

  const [
    updateTransactionTags,
    { loading, error },
  ] = useMutation<updateTransactionTags>(Queries.UPDATE_TRANSACTION_TAGS);

  useEffect(() => {
    // compute and update transactions
    console.dir("=======");
    console.dir(selectedTransactionIds);
    console.dir(tagsToAdd);
  }, [tagsToAdd, selectedTransactionIds]);

  return (
    <Grid container className={classes.body}>
      <Grid item container xs={12} direction="column" spacing={2}>
        <Grid item>
          <OutlinedGroup id={"filterGroup"} label={"Filters"}>
            <Grid item container xs={12} spacing={2}>
              <Grid item xs={6}>
                <TagsFilter
                  label={"Filter Tags"}
                  onChange={(tf: Tag[]) => setTagFilters(tf)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Description"
                  variant="outlined"
                  onChange={(event) =>
                    setDescriptionFilters(event.target.value)
                  }
                  className={classes.textField}
                />
              </Grid>
            </Grid>
          </OutlinedGroup>
        </Grid>

        <Grid item>
          <OutlinedGroup id={"updateGroup"} label={"Edit Transactions"}>
            <Grid item container xs={12} spacing={2}>
              <Grid item xs={6}>
                <TagsFilter
                  label={"Add Tags"}
                  onChange={(tagsToAdd: Tag[]) => setTagsToAdd(tagsToAdd)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Set Friendly Description"
                  variant="outlined"
                  onChange={(event) => console.dir(event.target.value)}
                  className={classes.textField}
                />
              </Grid>
            </Grid>
          </OutlinedGroup>
        </Grid>

        <Grid item>
          <TransactionsGrid
            onSelectedChanged={setSelectedTransactions}
            tagFilters={tagFilters}
            descriptionFilter={descriptionFilter}
          />
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

function TransactionsGrid(props: {
  tagFilters: Tag[];
  descriptionFilter: string;
  onSelectedChanged: (selectedIds: number[]) => void;
}) {
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
      onSelectedChanged={props.onSelectedChanged}
      rows={
        data?.transactions
          ? data.transactions
              .filter((t) => {
                return (
                  t.originalDescription
                    .toLowerCase()
                    .indexOf(props.descriptionFilter.toLowerCase()) !== -1
                );
              })
              .filter((t) => {
                return props.tagFilters.every(
                  (tf) => t.tags.map((tg) => tg.tag).indexOf(tf.tag) >= 0
                );
              })
              .map((t) => {
                return {
                  id: t.id,
                  date: t.date ?? "",
                  originalDescription: t.originalDescription,
                  friendlyDescription: t.friendlyDescription,
                  amount: t.amountCents / 100,
                  tags: t.tags.map((tg) => tg.tag).join(", "),
                };
              })
          : []
      }
    />
  );
}
