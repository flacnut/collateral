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

export type GridData = {
  id: number;
  date: string;
  originalDescription: string;
  friendlyDescription?: string | null;
  amount: number;
  tags?: Array<{ tag: string }>;
};

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
});

export function TransactionGrid(props: {
  transactions: GridData[];
  showTags: boolean;
}) {
  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell align="right">Description</StyledTableCell>
            <StyledTableCell align="right">Amount</StyledTableCell>
            {props.showTags ? (
              <StyledTableCell align="right">Tags</StyledTableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {props?.transactions?.map((row) => (
            <StyledTableRow key={row.id}>
              <StyledTableCell component="th" scope="row">
                {row.date}
              </StyledTableCell>
              <StyledTableCell align="right">
                {row.originalDescription}
              </StyledTableCell>
              <StyledTableCell align="right">{row.amount}</StyledTableCell>
              {props.showTags ? (
                <StyledTableCell align="right">
                  {row.tags?.map((t) => t.tag).join(", ")}
                </StyledTableCell>
              ) : null}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
