import React, { useEffect, useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import {
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { Tag, Account } from "../../common/types";
import TagAutoComplete from "../input/TagAutoComplete";
import AccountAutoComplete from "../input/AccountAutoComplete";
import {
  ListOptions,
  NumberCompareOptions,
  RichQueryFilter,
  TextMatchOptions,
} from "../../graphql/graphql-global-types";

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
  onChange: (filterOptions: RichQueryFilter) => void;
};

export default function FilterTransactionsView(props: Props) {
  const classes = useStyles();

  const [description, setDescription] = useState("");
  const [descriptionMatch, setDescriptionMatch] = useState("CONTAINS");

  const [amount, setAmount] = useState("");
  const [amountOther, setAmountOther] = useState("");
  const [amountMatch, setAmountMatch] = useState("EQUALS");

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagMatch, setTagMatch] = useState("ALL_OF");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountMatch, setAccountMatch] = useState("ANY_OF");

  const [date, setDate] = useState("");
  const [dateOther, setDateOther] = useState("");
  const [dateMatch, setDateMatch] = useState("EQUALS");

  useEffect(() => {
    const options: RichQueryFilter = {
      excludeTransfers: true,
    };

    if (amount !== "") {
      options.amount = {
        amountCents: Number(amount) * 100,
        secondAmountCents: Number(amountOther) * 100,
        compare: (NumberCompareOptions as any)[amountMatch],
      };
    }

    if (description !== "") {
      options.description = {
        text: [description],
        match: (TextMatchOptions as any)[descriptionMatch],
      };
    }

    if (date !== "") {
      options.date = {
        value: date,
        secondValue: dateOther,
        compare: (NumberCompareOptions as any)[dateMatch],
      };
    }

    if (tags.length > 0) {
      options.tags = {
        itemIds: tags.map((t) => t.id),
        queryBy: (ListOptions as any)[tagMatch],
      };
    }

    if (accounts.length > 0) {
      options.accounts = {
        itemIds: accounts.map((a) => a.id),
        queryBy: (ListOptions as any)[accountMatch],
      };
    }

    props.onChange(options);
  }, [
    description,
    descriptionMatch,
    amount,
    amountOther,
    amountMatch,
    tags,
    tagMatch,
    accounts,
    accountMatch,
    date,
    dateOther,
    dateMatch,
  ]);

  return (
    <Grid item>
      {/* DESCRIPTION */}
      <Grid container direction="row" spacing={2}>
        <Grid container item xs={2}>
          <div className={classes.label}>
            <Typography>Description</Typography>
          </div>
        </Grid>
        <Grid item xs={2}>
          <FormControl variant="outlined" className={classes.input}>
            <Select
              id="description_filter"
              value={descriptionMatch}
              onChange={(e) => setDescriptionMatch(e.target.value as string)}
            >
              <MenuItem value="CONTAINS">Contains</MenuItem>
              <MenuItem value="EQUALS">Is Exactly</MenuItem>
              <MenuItem value={"STARTS_WITH"}>Starts With</MenuItem>
              <MenuItem value={"ENDS_WITH"}>Ends With</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <TextField
            className={classes.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            label="Description"
            variant="outlined"
          />
        </Grid>
      </Grid>

      {/* AMOUNT */}
      <Grid container direction="row" spacing={2}>
        <Grid container item xs={2}>
          <div className={classes.label}>
            <Typography>Amount</Typography>
          </div>
        </Grid>
        <Grid item xs={2}>
          <FormControl variant="outlined" className={classes.input}>
            <Select
              id="description_filter"
              value={amountMatch}
              onChange={(e) => setAmountMatch(e.target.value as string)}
            >
              <MenuItem value="BETWEEN">Between</MenuItem>
              <MenuItem value="EQUALS">=</MenuItem>
              <MenuItem value={"GREATER_THAN"}>&gt;</MenuItem>
              <MenuItem value={"GREATER_THAN_OET"}>&gt;=</MenuItem>
              <MenuItem value={"LESS_THAN"}>&lt;</MenuItem>
              <MenuItem value={"LESS_THAN_OET"}>&lt;=</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <OutlinedInput
            className={classes.input}
            value={amount}
            onChange={(e) => setAmount(e.target.value as string)}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </Grid>
        <Grid item xs={4}>
          <OutlinedInput
            className={classes.input}
            value={amountOther}
            onChange={(e) => setAmountOther(e.target.value as string)}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            disabled={amountMatch !== "BETWEEN"}
          />
        </Grid>
      </Grid>

      {/* TAGS */}
      <Grid container direction="row" spacing={2}>
        <Grid container item xs={2}>
          <div className={classes.label}>
            <Typography>Tags</Typography>
          </div>
        </Grid>
        <Grid item xs={2}>
          <FormControl variant="outlined" className={classes.input}>
            <Select
              id="description_filter"
              value={tagMatch}
              onChange={(e) => setTagMatch(e.target.value as string)}
            >
              <MenuItem value="ALL_OF">Contains All Of</MenuItem>
              <MenuItem value="ANY_OF">Contains Any Of</MenuItem>
              <MenuItem value="NONE_OF">Contains None Of</MenuItem>
              <MenuItem value="EMPTY">Is Empty</MenuItem>
              <MenuItem value="NOT_EMPTY">Is Not Empty</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <TagAutoComplete
            id="tagsAutoComplete_n"
            className={classes.input}
            options={props.tagOptions}
            onChange={(_tags: Tag[]) => setTags(_tags)}
            initialValue={tags}
            variant="outlined"
            mode="select"
            disabled={tagMatch === "EMPTY" || tagMatch === "NOT_EMPTY"}
          />
        </Grid>
      </Grid>

      {/* AMOUNT */}
      <Grid container direction="row" spacing={2}>
        <Grid container item xs={2}>
          <div className={classes.label}>
            <Typography>Date</Typography>
          </div>
        </Grid>
        <Grid item xs={2}>
          <FormControl variant="outlined" className={classes.input}>
            <Select
              id="description_filter"
              value={dateMatch}
              onChange={(e) => setDateMatch(e.target.value as string)}
            >
              <MenuItem value="BETWEEN">Between</MenuItem>
              <MenuItem value="EQUALS">On</MenuItem>
              <MenuItem value="GREATER_THAN">After</MenuItem>
              <MenuItem value="GREATER_THAN_OET">On or After</MenuItem>
              <MenuItem value="LESS_THAN">Before</MenuItem>
              <MenuItem value="LESS_THAN_OET">Before or On</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="date1"
            type="date"
            variant="outlined"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={classes.input}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="date2"
            type="date"
            variant="outlined"
            disabled={dateMatch !== "BETWEEN"}
            value={dateOther}
            onChange={(e) => setDateOther(e.target.value)}
            defaultValue="2017-05-24"
            className={classes.input}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>

      {/* ACCOUNTS */}
      <Grid container direction="row" spacing={2}>
        <Grid container item xs={2}>
          <div className={classes.label}>
            <Typography>Accounts</Typography>
          </div>
        </Grid>
        <Grid item xs={2}>
          <FormControl variant="outlined" className={classes.input}>
            <Select
              id="description_filter"
              value={accountMatch}
              onChange={(e) => setAccountMatch(e.target.value as string)}
            >
              <MenuItem value="ANY_OF">Contains Any Of</MenuItem>
              <MenuItem value="NONE_OF">Contains None Of</MenuItem>
              <MenuItem value="EMPTY">Is Empty</MenuItem>
              <MenuItem value="NOT_EMPTY">Is Not Empty</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <AccountAutoComplete
            id="tagsAutoComplete_n"
            className={classes.input}
            options={props.accountOptions}
            onChange={(_accounts: Account[]) => setAccounts(_accounts)}
            initialValue={accounts}
            variant="outlined"
            disabled={tagMatch === "EMPTY" || tagMatch === "NOT_EMPTY"}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
