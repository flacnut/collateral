import * as React from 'react';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { getAllAccounts_allAccounts } from '../../graphql/types/getAllAccounts';
import Queries from '../../graphql/Queries';
import { useMutation } from '@apollo/client';
import { generateBalancesForAccount } from '../../graphql/types/generateBalancesForAccount';
import { makeStyles } from "@material-ui/core/styles";
import { Button, InputAdornment, OutlinedInput, TextField } from '@material-ui/core';
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";

type Props = {
  accounts: getAllAccounts_allAccounts[],
};

const useStyles = makeStyles({
  expense: {
    color: "#F23753",
  },
  deposit: {
    color: "#3CF237",
  }
});

function Row(props: { account: getAllAccounts_allAccounts }) {
  const { account } = props;
  const [open, setOpen] = React.useState(false);

  const [generateBalances] = useMutation<generateBalancesForAccount>(
    Queries.GENERATE_BALANCES_FOR_ACCOUNT
  );

  const genBalances = async (id: Number, date: Date, amountCents: Number) => {
    await generateBalances({
      variables: {
        accountId: id,
        knownBalance: {
          date: date,
          amountCents: amountCents,
        }
      },
      refetchQueries: [{ query: Queries.GET_ALL_ACCOUNTS }],
    });
  };

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const formattedAmount = account.latestBalance ? formatter.format(Number(account.latestBalance?.balanceCents) * 0.01) : null;
  const classes = useStyles();
  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {account.institution}
        </TableCell>
        <TableCell align="right">{account.accountName}</TableCell>
        <TableCell align="right">{account.accountNumber}</TableCell>
        <TableCell align="right" className={Number(account.latestBalance?.balanceCents) < 0 ? classes.expense : classes.deposit}>{formattedAmount}</TableCell>
        <TableCell align="right">{account.latestTransaction?.date}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
              <TextField
                id="date1"
                type="date"
                variant="outlined"
                disabled={true}
                value={(new Date(account.knownBalanceDate)).toISOString().split('T')[0]}
                onChange={(e: any) => console.dir("DO LATER")}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <OutlinedInput
                disabled={true}
                value={account.knownBalanceAmountCents}
                onChange={(e) => console.dir("DO LATER")}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
              />
              <Button
                disabled={true}
                variant="contained"
                color="primary"
                onClick={() => genBalances(account.id, account.knownBalanceDate, account.knownBalanceAmountCents ?? 0)}
                startIcon={<SwapHorizIcon />}
              >
                Calculate Balance
              </Button>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export function AccountsGrid(props: Props) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Institution</TableCell>
            <TableCell align="right">Name</TableCell>
            <TableCell align="right">Number</TableCell>
            <TableCell align="right">Latest Balance</TableCell>
            <TableCell align="right">Latest Transaction</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.accounts.map((account) => (
            <Row key={account.id} account={account} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}