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


type Props = {
  accounts: getAllAccounts_allAccounts[],
};

function Row(props: { account: getAllAccounts_allAccounts }) {
  const { account } = props;
  const [open, setOpen] = React.useState(false);

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
        <TableCell align="right">{account.latestBalance?.balanceCents}</TableCell>
        <TableCell align="right">{account.latestTransaction?.date}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
              <Typography variant="h6" gutterBottom component="div">
                Expand
              </Typography>
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