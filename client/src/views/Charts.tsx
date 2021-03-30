import React, { useEffect, useState } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import TagMultiSelector from "../components/input/TagMultiSelector";
import Queries from "../graphql/Queries";
import { getAllTags } from "../graphql/types/getAllTags";
import { Grid } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import OutlinedGroup from "../components/OutlinedGroup";
import { TransactionGrid } from "../components/grids";
import { getTransactionsByTags } from "../graphql/types/getTransactionsByTags";

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
