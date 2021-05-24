import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { SelectableTransactionGrid } from "../components/grids";
import TagMultiSelector from "../components/input/TagMultiSelector";
import AccountMultiSelector from "../components/input/AccountMultiSelector";
import Queries from "../graphql/Queries";
import { getAllTransactions } from "../graphql/types/getAllTransactions";
import { createTagRule } from "../graphql/types/createTagRule";
import { getAllTags } from "../graphql/types/getAllTags";
import { updateTransactionTags } from "../graphql/types/updateTransactionTags";
import { createSingleTag } from "../graphql/types/createSingleTag";
import { TransactionUpdateTagsInput } from "../graphql/graphql-global-types";
import { TextField, Grid, Button } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import OutlinedGroup from "../components/OutlinedGroup";
import { Refresh, Save } from "@material-ui/icons";
import { getAllAccounts } from "../graphql/types/getAllAccounts";
import { CircularProgress } from "@material-ui/core";

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
    buttons: {
      width: 140,
      marginLeft: 20,
    },
    buttonTextbox: {
      width: "100%",
      height: "100%",
      position: "relative",
      display: "flex",
    },
    buttonTextboxText: {
      flexGrow: 1,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
    },
    buttonTextboxButton: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      height: "100%",
    },
  })
);

type Tag = {
  id: number;
  tag: string;
};

type Account = {
  id: number;
  name: string;
};

export default function Transactions() {
  const classes = useStyles();

  const [savingTagUpdate, setSavingTagUpdate] = useState(false);
  const [tagFilters, setTagFilters] = useState<Tag[]>([]);
  const [accountFilters, setAccountFilters] = useState<Account[]>([]);
  const [amountMinFilter, setAmountMinFilter] = useState<number | null>(null);
  const [amountMaxFilter, setAmountMaxFilter] = useState<number | null>(null);
  const [ruleName, setRuleName] = useState<String | null>(null);
  const [tagsToAdd, setTagsToAdd] = useState<Tag[]>([]);
  const [descriptionFilter, setDescriptionFilters] = useState("");
  const [allRowsSelected, setAllRowsSelected] = useState(false);
  const [selectedTransactionIds, setSelectedTransactions] = useState<number[]>(
    []
  );

  const [createTagRule] = useMutation<createTagRule>(Queries.CREATE_TAG_RULE);
  const [createTag] = useMutation<createSingleTag>(Queries.CREATE_TAG);
  const [updateTransactionTags] = useMutation<updateTransactionTags>(
    Queries.UPDATE_TRANSACTION_TAGS
  );

  const saveTagRule = async () => {
    // BAD COPY PASTA
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

    await createTagRule({
      variables: {
        options: {
          name: ruleName,
          minimumAmount: amountMinFilter,
          maximumAmount: amountMaxFilter,
          descriptionContains: descriptionFilter,
          tagsToAdd: tagsToAddWithIds.map((tag) => tag.id),
          forAccounts: accountFilters
            .map((acc) => acc.id)
            .filter((id) => id > 0) /* remove 'any' */,
        },
      },
    });
  };

  const performSave = async () => {
    setSavingTagUpdate(true);
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

    const updateData = selectedTransactionIds.map((id) => {
      return {
        id,
        tags: tagsToAddWithIds.map((tag) => tag.id),
      } as TransactionUpdateTagsInput;
    });

    await updateTransactionTags({
      variables: { options: updateData },
      refetchQueries: [{ query: Queries.GET_ALL_TAGS }],
    });
    setSavingTagUpdate(false);
  };

  return (
    <Grid container className={classes.body}>
      <Grid item container xs={12} direction="column" spacing={2}>
        <Grid item>
          <OutlinedGroup id={"filterGroup"} label={"Filters"}>
            <Grid item container xs={12} spacing={2}>
              <Grid item xs={4}>
                <TagsFilter
                  label={"Filter Tags"}
                  onChange={(tf: Tag[]) => setTagFilters(tf)}
                />
              </Grid>
              <Grid item xs={4}>
                <AccountsFilter
                  onChange={(acc: Account[]) => setAccountFilters(acc)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Description"
                  variant="outlined"
                  onBlur={(event) => setDescriptionFilters(event.target.value)}
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Amount (min)"
                  variant="outlined"
                  onBlur={(event) =>
                    setAmountMinFilter(Number(event.target.value))
                  }
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Amount (max)"
                  variant="outlined"
                  onBlur={(event) =>
                    setAmountMaxFilter(Number(event.target.value))
                  }
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={4}>
                <div className={classes.buttonTextbox}>
                  <TextField
                    label="Save Rule"
                    variant="outlined"
                    onChange={(event) => setRuleName(event.target.value)}
                    className={classes.buttonTextboxText}
                  />
                  <Button
                    className={classes.buttonTextboxButton}
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    disabled={
                      !allRowsSelected ||
                      ruleName == null ||
                      ruleName.length < 3
                    }
                    onClick={() => saveTagRule()}
                  />
                </div>
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

        <Grid item container xs={12} direction="row-reverse" spacing={0}>
          <Grid item>
            {savingTagUpdate ? (
              <CircularProgress
                variant="indeterminate"
                disableShrink
                className={classes.buttons}
                size={40}
                thickness={4}
              />
            ) : (
              <Button
                className={classes.buttons}
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={performSave}
              >
                Save
              </Button>
            )}
          </Grid>
          <Grid item>
            <Button
              className={classes.buttons}
              variant="contained"
              color="secondary"
              startIcon={<Refresh />}
              disabled={true}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          <TransactionsGrid
            onSelectedChanged={setSelectedTransactions}
            onAllSelected={(isAllSelected: boolean) =>
              setAllRowsSelected(isAllSelected)
            }
            tagFilters={tagFilters}
            accountFilters={accountFilters}
            amountMinFilter={amountMinFilter}
            amountMaxFilter={amountMaxFilter}
            descriptionFilter={descriptionFilter}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

function TagsFilter(props: { label: string; onChange: (tags: Tag[]) => void }) {
  const tagsResult = useQuery<getAllTags>(Queries.GET_ALL_TAGS);
  return (
    <div>
      <TagMultiSelector
        label={props.label}
        onChange={props.onChange}
        tags={
          tagsResult.data?.tags
            ? tagsResult.data.tags.map((t) => {
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

function AccountsFilter(props: { onChange: (options: Account[]) => void }) {
  const accountsResult = useQuery<getAllAccounts>(Queries.GET_ALL_ACCOUNTS);
  return (
    <div>
      <AccountMultiSelector
        label={"Accounts"}
        onChange={props.onChange}
        options={
          accountsResult.data?.allAccounts
            ? accountsResult.data?.allAccounts.map((a) => {
                return { id: a.id, name: a.accountName };
              })
            : []
        }
      />
    </div>
  );
}

function TransactionsGrid(props: {
  tagFilters: Tag[];
  accountFilters: Account[];
  descriptionFilter: string;
  amountMinFilter: number | null;
  amountMaxFilter: number | null;
  onSelectedChanged: (selectedIds: number[]) => void;
  onAllSelected: (isAllSelected: boolean) => void;
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
      onAllSelected={props.onAllSelected}
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
                if (
                  props.amountMinFilter &&
                  t.amountCents < props.amountMinFilter * 100
                ) {
                  return false;
                }

                if (
                  props.amountMaxFilter &&
                  t.amountCents > props.amountMaxFilter * 100
                ) {
                  return false;
                }

                return true;
              })
              .filter((t) => {
                return props.accountFilters.some(
                  (af) =>
                    af.id === t.account.id || af.id === 0 /* any account */
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
                  friendlyDescription: t.friendlyDescription ?? "",
                  amount: t.amountCents / 100,
                  tags: t.tags.map((tg) => tg.tag).join(", "),
                };
              })
          : []
      }
    />
  );
}
