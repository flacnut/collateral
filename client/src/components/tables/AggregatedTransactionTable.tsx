import {
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { fCurrency } from 'src/utils/formatNumber';
import { CustomAvatar } from '../custom-avatar';
import Label from '../label';
import Scrollbar from '../scrollbar';
import TableEmptyRows from '../table/TableEmptyRows';
import TableHeadCustom from '../table/TableHeadCustom';
import TablePaginationCustom from '../table/TablePaginationCustom';
import useTable from '../table/useTable';
import { emptyRows } from '../table/utils';
import { IBasicAccount, ITag } from './BasicTransactionTable';

export type IAggregatedTransaction = {
  key: string;
  transactionIds: string[];
  accountId: string;
  description: string;
  amountCents: number;
  amount: number;
  count: number;
  currency: string | null;
  classification: string;
  account: IBasicAccount;
  tags: ITag[];
};

export function AggregatedTransactionTable(props: {
  transactions: IAggregatedTransaction[];
  action: (row: IAggregatedTransaction) => void;
}) {
  const { transactions, action } = props;
  const TABLE_HEAD = [
    { id: 'description', label: 'Description', align: 'left' },
    { id: 'amount', label: 'Amount', align: 'right', width: 180 },
    { id: 'count', label: 'Count', align: 'left', width: 140 },
    { id: 'classification', label: 'Classification', align: 'center', width: 240 },
    { id: 'tags', label: 'Tags', align: 'left' },
    { id: 'action', label: '', align: 'left', width: 100 },
  ];

  const { safe, page, order, orderBy, onSort, onChangeSafe, onChangePage } = useTable({
    defaultRowsPerPage: 25,
    defaultOrderBy: 'date',
  });

  return (
    <>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size={'small'} sx={{ minWidth: 800 }}>
            <TableHeadCustom
              order={order}
              orderBy={orderBy}
              headLabel={TABLE_HEAD}
              rowCount={transactions.length}
              onSort={onSort}
            />

            <TableBody>
              {transactions.slice(page * 25, page * 25 + 25).map((transaction, index) => (
                <TransactionTableRow
                  key={index.toString()}
                  transaction={transaction}
                  safe={safe}
                  action={action}
                />
              ))}
              <TableEmptyRows height={56} emptyRows={emptyRows(page, 25, transactions.length)} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePaginationCustom
        count={transactions.length}
        page={page}
        rowsPerPage={25}
        onPageChange={onChangePage}
        safe={safe}
        onChangeSafe={onChangeSafe}
      />
    </>
  );
}

function TransactionTableRow(props: {
  key: string;
  transaction: IAggregatedTransaction;
  safe: boolean;
  action: (row: IAggregatedTransaction) => void;
}) {
  const { transaction, safe, action } = props;
  return (
    <TableRow hover>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CustomAvatar name={transaction.description} />

          <div>
            <Typography variant="subtitle2" noWrap color="MenuText" sx={{ color: '#FFF' }}>
              {transaction.description}
            </Typography>

            <Typography noWrap variant="body2" sx={{ color: '#919eab' }}>
              {transaction.account.name}
            </Typography>
          </div>
        </Stack>
      </TableCell>

      <TableCell align="right">
        <Typography
          fontFamily="Menlo"
          color={transaction.amount > 0 ? '#36B37E' : '#FF5630'}
          fontWeight="bold"
        >
          {safe ? 'X,XXX.XX' : fCurrency(Math.abs(transaction.amount), true)}
        </Typography>
      </TableCell>

      <TableCell align="left">{transaction.count}</TableCell>

      <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
        {transaction.classification !== null ? (
          <Label
            variant="soft"
            color={
              (transaction.classification === 'Expense' && 'error') ||
              (transaction.classification === 'Income' && 'success') ||
              (transaction.classification === 'Duplicate' && 'secondary') ||
              (transaction.classification === 'Recurring' && 'warning') ||
              (transaction.classification === 'Transfer' && 'secondary') ||
              (transaction.classification === 'Investment' && 'primary') ||
              (transaction.classification === 'Hidden' && 'secondary') ||
              'default'
            }
          >
            {transaction.classification}
          </Label>
        ) : null}
      </TableCell>

      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        {transaction.tags.map((tag, index) => (
          <Chip
            key={index}
            size={'small'}
            label={tag.name}
            sx={{ marginRight: 1, borderRadius: 1 }}
          />
        ))}
      </TableCell>

      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        {action ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => action(transaction)}
            color="secondary"
          >
            Apply
          </Button>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
