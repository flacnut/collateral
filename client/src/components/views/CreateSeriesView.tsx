import React, { useEffect, useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { Tag, Account } from "../../common/types";
import TagAutoComplete from "../input/TagAutoComplete";
import { RichQueryFilter } from "../../graphql/graphql-global-types";
import { useQuery } from "@apollo/client";
import { getFilteredTransactions } from "../../graphql/types/getFilteredTransactions";
import Queries from "../../graphql/Queries";
import FilterTransactionsView from "./FilterTransactionsView";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      margin: "auto",
      marginLeft: 0,
    },
    input: {
      width: "100%",
    },
  })
);

type Props = {
  tagOptions: Tag[];
  accountOptions: Account[];
  /*onChange: (filterOptions: RichQueryFilter) => void;*/
};

export default function CreateSeriesView(props: Props) {
  const classes = useStyles();
  const [groupTags, setGroupTags] = useState<Tag[]>([]);
  const [groupableTags, setGroupableTags] = useState<Tag[]>([]);
  const [filterOptions, setFilterOptions] = useState<RichQueryFilter>({
    excludeTransfers: true,
  });

  const { data } = useQuery<getFilteredTransactions>(
    Queries.GET_FILTERED_TRANSACTIONS,
    {
      variables: {
        options: {
          where: filterOptions,
        },
      },
    }
  );

  useEffect(() => {
    const tags: Tag[][] =
      data?.getFilteredTransactions?.map((t) => t.tags as Tag[]) ?? [];
    const dedupedTags = Object.values(
      tags.flat().reduce((set, tag: Tag) => {
        set[tag.tag] = tag;
        return set;
      }, {} as { [key: string]: Tag })
    );
    setGroupableTags(dedupedTags);
  }, [data]);

  return (
    <Grid item>
      <FilterTransactionsView {...props} onChange={setFilterOptions} />
      <Grid container direction="row" spacing={2}>
        <Grid container item xs={2}>
          <div className={classes.label}>
            <Typography>
              Found {data?.getFilteredTransactions.length} transactions.
            </Typography>
          </div>
        </Grid>
      </Grid>
      <Grid container direction="row" spacing={2}>
        <Grid container item xs={2}>
          <div className={classes.label}>
            <Typography>Group By</Typography>
          </div>
        </Grid>
        <Grid container item>
          <TagAutoComplete
            id="groupby_tags"
            className={classes.input}
            options={groupableTags}
            onChange={setGroupTags}
            initialValue={groupTags}
            variant="outlined"
            mode="select"
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
