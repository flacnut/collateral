import { Helmet } from 'react-helmet-async';
import { SetStateAction, useEffect, useState } from 'react';
import sumBy from 'lodash/sumBy';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Tab,
  Tabs,
  Card,
  Table,
  Stack,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TextField,
  MenuItem,
  TextFieldProps,
  InputAdornment,
  TableRow,
  TableCell,
  Typography,
  Link,
  Checkbox,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../routes/paths';
// utils
import { fDate, fTimestamp } from '../utils/formatTime';

// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import ConfirmDialog from '../components/confirm-dialog';
import CustomBreadcrumbs from '../components/custom-breadcrumbs';
import { useSettingsContext } from '../components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../components/table';
// sections
import { gql } from 'src/__generated__/gql';
import { DatePicker } from '@mui/x-date-pickers';
import MenuPopover from 'src/components/menu-popover';
import { CustomAvatar } from 'src/components/custom-avatar';
import { fCurrency } from 'src/utils/formatNumber';
import { useQuery } from '@apollo/client';

// ----------------------------------------------------------------------

const SERVICE_OPTIONS = [
  'all',
  'full stack development',
  'backend development',
  'ui design',
  'ui/ux design',
  'front end development',
];

const TABLE_HEAD = [
  { id: 'description', label: 'Description', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'right' },
  { id: 'date', label: 'Date', align: 'left', width: 140 },
  { id: '__typename', label: 'Type', align: 'center', width: 140 },
  { id: 'classification', label: 'Category', align: 'center', width: 240 },
  { id: '' },
];

type IBasicTransaction = {
  __typename: string;
  id: string;
  accountId: string;
  description: string;
  amountCents: number;
  amount: number;
  date: string;
  currency: string | null;
  classification: string;
  account: IBasicAccount;
};

type IBasicAccount = {
  id: string;
  name: string;
};

const transactionsQuery = gql(`
query getBasicTransactions($accountId: String, $limit: Int, $offset: Int) {
  getTransactions(accountId: $accountId, limit: $limit, after: $offset) {
    __typename
  	...on PlaidTransaction {
      ...CorePlaidTransactionParts
      account {
        id
        name
      }
    }
    ... on PlaidHoldingTransaction {
      ...CoreHoldingTransactionParts
      account {
        id
        name
      }
    }
  }
}

fragment CorePlaidTransactionParts on PlaidTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}

fragment CoreHoldingTransactionParts on PlaidHoldingTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}`);

const Classifications = [
  "Duplicate",
  "Income",
  "Expense",
  "Recurring",
  "Transfer",
  "Investment",
];

// ----------------------------------------------------------------------

export default function PageOne() {
  const theme = useTheme();
  const { loading, data, refetch } = useQuery(transactionsQuery, { variables: { offset: 0, limit: 500 } });
  useEffect(() => {
    const maybedata = data?.getTransactions as unknown[] | null;
    const transactionData = (maybedata ?? []) as IBasicTransaction[];
    const accounts = transactionData.reduce(
      (accounts: { [key: string]: IBasicAccount }, transaction) => {
        if (!accounts[transaction.accountId]) {
          accounts[transaction.accountId] = transaction.account;
        }
        return accounts;
      }, {});
    setTableData(transactionData);
    setAccounts(Object.values(accounts));
  }, [data]);

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultRowsPerPage: 50, defaultOrderBy: 'createDate' });

  const [tableData, setTableData] = useState<IBasicTransaction[]>([]);
  const [accounts, setAccounts] = useState<IBasicAccount[]>([]);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterDescription, setFilterDescription] = useState('');
  const [filterAccount, setFilterAccount] = useState('all');

  const [filterClassification, setFilterClassification] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterDescription,
    filterClassification,
    filterStartDate,
    filterEndDate,
    filterAccount,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 56 : 76;

  const isFiltered =
    filterClassification !== 'all' ||
    filterDescription !== '' ||
    filterAccount !== 'all' ||
    (!!filterStartDate && !!filterEndDate);

  const isNotFound =
    (!dataFiltered.length && !!filterDescription) ||
    (!dataFiltered.length && !!filterClassification) ||
    (!dataFiltered.length && !!filterEndDate) ||
    (!dataFiltered.length && !!filterStartDate);

  const getLengthByStatus = (classification: string) =>
    tableData.filter((transaction) => transaction.classification === classification).length;

  const getTotalPriceByStatus = (classification: string) =>
    sumBy(
      tableData.filter((transaction) => transaction.classification === classification),
      'totalPrice'
    );

  const getPercentByStatus = (status: string) =>
    (getLengthByStatus(status) / tableData.length) * 100;

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterClassification = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterClassification(event.target.value);
  };

  const handleFilterDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterDescription(event.target.value);
  };

  const handleFilterAccount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterAccount(event.target.value);
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row: { id: string }) => row.id !== id);
    setSelected([]);
    setTableData(deleteRow);

    if (page > 0) {
      if (dataInPage.length < 2) {
        setPage(page - 1);
      }
    }
  };

  const handleDeleteRows = (selected: string[]) => {
    const deleteRows = tableData.filter((row: { id: string }) => !selected.includes(row.id));
    setSelected([]);
    setTableData(deleteRows);

    if (page > 0) {
      if (selected.length === dataInPage.length) {
        setPage(page - 1);
      } else if (selected.length === dataFiltered.length) {
        setPage(0);
      } else if (selected.length > dataInPage.length) {
        const newPage = Math.ceil((tableData.length - selected.length) / rowsPerPage) - 1;
        setPage(newPage);
      }
    }
  };

  const handleEditRow = (id: string) => {
    //navigate(PATH_DASHBOARD.transaction.edit(id));
  };

  const handleViewRow = (id: string) => {
    //navigate(PATH_DASHBOARD.transaction.view(id));
  };

  const handleResetFilter = () => {
    setFilterDescription('');
    setFilterClassification('all');
    setFilterAccount('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  return (
    <>
      <Helmet>
        <title> Transaction: List | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Transaction List"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Transactions',
              href: '', //PATH_DASHBOARD.transaction.root,
            },
            {
              name: 'List',
            },
          ]}
          action={
            <Button
              to={PATH_DASHBOARD.transactions /*.transaction.new*/}
              component={RouterLink}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Transaction
            </Button>
          }
        />

        <Card>

          <TransactionTableToolbar
            accounts={accounts}
            onFilterAccount={handleFilterAccount}
            filterAccount={filterAccount}
            isFiltered={isFiltered}
            filterDescription={filterDescription}
            filterEndDate={filterEndDate}
            filterClassification={filterClassification}
            onFilterDescription={handleFilterDescription}
            onFilterClassification={handleFilterClassification}
            onResetFilter={handleResetFilter}
            filterStartDate={filterStartDate}
            onFilterStartDate={(newValue: SetStateAction<Date | null>) => {
              setFilterStartDate(newValue);
            }}
            onFilterEndDate={(newValue: SetStateAction<Date | null>) => {
              setFilterEndDate(newValue);
            }}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={dense}
              numSelected={selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked: any) =>
                onSelectAllRows(
                  checked,
                  tableData.map((row: { id: any }) => row.id)
                )
              }
              action={
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="ic:round-send" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="eva:printer-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={handleOpenConfirm}>
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked: any) =>
                    onSelectAllRows(
                      checked,
                      tableData.map((row: { id: any }) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TransactionTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                  />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            //
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows(selected);
              handleCloseConfirm();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterDescription,
  filterClassification,
  filterStartDate,
  filterEndDate,
  filterAccount,
}: {
  inputData: IBasicTransaction[];
  comparator: (a: any, b: any) => number;
  filterDescription: string;
  filterClassification: string;
  filterStartDate: Date | null;
  filterEndDate: Date | null;
  filterAccount: string;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterDescription) {
    inputData = inputData.filter(
      (transaction) =>
        transaction.description.toLowerCase().indexOf(filterDescription.toLowerCase()) !== -1
    );
  }

  if (filterStartDate && filterEndDate) {
    inputData = inputData.filter(
      (transaction) =>
        fTimestamp(transaction.date) >= fTimestamp(filterStartDate) &&
        fTimestamp(transaction.date) <= fTimestamp(filterEndDate)
    );
  }

  if (filterAccount !== 'all') {
    inputData = inputData.filter((transaction) =>
      transaction.account.name === filterAccount
    );
  }

  if (filterClassification !== 'all') {
    inputData = inputData.filter((transaction) => transaction.classification === filterClassification);
  }

  return inputData;
}

const INPUT_WIDTH = 160;

function TransactionTableToolbar({
  accounts,
  filterDescription,
  isFiltered,
  onFilterDescription,
  filterEndDate,
  filterAccount,
  onResetFilter,
  filterStartDate,
  onFilterAccount,
  onFilterEndDate,
  onFilterStartDate,
  onFilterClassification,
  filterClassification,
}: {
  accounts: IBasicAccount[];
  filterDescription: string;
  filterClassification: string;
  isFiltered: boolean;
  filterAccount: string;
  filterEndDate: Date | null;
  onResetFilter: VoidFunction;
  filterStartDate: Date | null;
  onFilterClassification: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterDescription: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterAccount: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterStartDate: (value: Date | null) => void;
  onFilterEndDate: (value: Date | null) => void;
}) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{ px: 2.5, py: 3 }}
    >

      <TextField
        fullWidth
        select
        label="Account"
        value={filterAccount}
        onChange={onFilterAccount}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 220 },
            },
          },
        }}
        sx={{
          maxWidth: { md: INPUT_WIDTH },
          textTransform: 'capitalize',
        }}
      >
        <MenuItem
          key={"all"}
          value={"all"}
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 0.75,
            typography: 'body2',
            textTransform: 'capitalize',
            '&:first-of-type': { mt: 0 },
            '&:last-of-type': { mb: 0 },
          }}
        >
          All
        </MenuItem>
        {accounts.map((account) => (
          <MenuItem
            key={account.id}
            value={account.name}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
              '&:first-of-type': { mt: 0 },
              '&:last-of-type': { mb: 0 },
            }}
          >
            {account.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        select
        label="Classification type"
        value={filterClassification}
        onChange={onFilterClassification}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 220 },
            },
          },
        }}
        sx={{
          maxWidth: { md: INPUT_WIDTH },
          textTransform: 'capitalize',
        }}
      >
        <MenuItem
          key={"all"}
          value={"all"}
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 0.75,
            typography: 'body2',
            textTransform: 'capitalize',
            '&:first-of-type': { mt: 0 },
            '&:last-of-type': { mb: 0 },
          }}
        >
          All
        </MenuItem>
        {Classifications.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
              '&:first-of-type': { mt: 0 },
              '&:last-of-type': { mb: 0 },
            }}
          >
            {option}
          </MenuItem>
        ))}
      </TextField>

      <DatePicker
        label="Start date"
        value={filterStartDate}
        onChange={onFilterStartDate}
        renderInput={(params: JSX.IntrinsicAttributes & TextFieldProps) => (
          <TextField
            {...params}
            fullWidth
            sx={{
              maxWidth: { md: INPUT_WIDTH },
            }}
          />
        )}
      />

      <DatePicker
        label="End date"
        value={filterEndDate}
        onChange={onFilterEndDate}
        renderInput={(params: JSX.IntrinsicAttributes & TextFieldProps) => {
          console.dir(params);
          return <TextField
            {...params}
            fullWidth
            sx={{
              maxWidth: { md: INPUT_WIDTH },
            }}
          />;
        }}
      />


      <TextField
        fullWidth
        value={filterDescription}
        onChange={onFilterDescription}
        placeholder="Search client or transaction number..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      {isFiltered && (
        <Button
          color="error"
          sx={{ flexShrink: 0 }}
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Clear
        </Button>
      )}
    </Stack>
  );
}

function TransactionTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}: {
  row: IBasicTransaction;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
}) {
  const { date, description, amount, __typename, classification, accountId } = row;

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CustomAvatar name={description} />

            <div>
              <Typography variant="subtitle2" noWrap>
                {description}
              </Typography>

              <Link
                noWrap
                variant="body2"
                onClick={onViewRow}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              >
                {row.account.name}
              </Link>
            </div>
          </Stack>
        </TableCell>

        <TableCell align="right">
          <Typography fontFamily="Lucida Sans Typewriter" color={amount > 0 ? "#36B37E" : "#FF5630"} fontWeight="bold">{fCurrency(amount)}
          </Typography>
        </TableCell>

        <TableCell align="left">{fDate(date)}</TableCell>

        <TableCell align="left">
          <Label
            variant="soft"
            color={
              (__typename === 'PlaidHoldingTransaction' && 'primary') ||
              (__typename === 'PlaidTransaction' && 'secondary') ||
              'default'
            }
          >
            {__typename}
          </Label>
        </TableCell>

        <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
          {classification}
        </TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:eye-fill" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem>
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
