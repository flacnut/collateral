import React from "react";
import {
  withStyles,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import TagAutoComplete from "../input/TagAutoComplete";
import { useQuery } from "@apollo/client";
import { getAllTags } from "../../graphql/types/getAllTags";
import Queries from "../../graphql/Queries";
import { Transaction } from "../../common/types";

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
)(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
  tagsColumn: {
    minWidth: 200,
  },
});

export function TransactionGrid(props: {
  transactions: Transaction[];
  showTags: boolean;
}) {
  const classes = useStyles();
  const tagOptionsResult = useQuery<getAllTags>(Queries.GET_ALL_TAGS);

  var formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  console.dir(JSON.stringify(props.transactions));

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell align="right">Description</StyledTableCell>
            <StyledTableCell align="right">Amount</StyledTableCell>
            {props.showTags ? (
              <StyledTableCell align="right" className={classes.tagsColumn}>
                Tags
              </StyledTableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {props?.transactions?.map((row, index) => (
            <StyledTableRow key={row.id}>
              <StyledTableCell component="th" scope="row">
                {row.date.toLocaleDateString()}
              </StyledTableCell>
              <StyledTableCell align="right">
                {row.originalDescription}
              </StyledTableCell>
              <StyledTableCell align="right">
                {formatter.format(row.amountCents / 100)}
              </StyledTableCell>
              {props.showTags ? (
                <StyledTableCell align="right" className={classes.tagsColumn}>
                  <TagAutoComplete
                    id={"tag-auto-complete-" + index}
                    options={tagOptionsResult.data?.tags ?? []}
                    onChange={(t) => console.dir(t)}
                    initialValue={row.tags ?? []}
                    variant="standard"
                    mode="select"
                    disabled={true}
                  />
                </StyledTableCell>
              ) : null}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
