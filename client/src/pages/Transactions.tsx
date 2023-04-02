import { Helmet } from 'react-helmet-async';
import { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
//import Chart from 'react-apexcharts';
// @mui
//import { useTheme } from '@mui/material/styles';
import {
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
  Chip,
  Autocomplete,
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
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { RHFAutocomplete } from '../components/hook-form';
import { GetBasicTransactionsQuery } from 'src/__generated__/graphql';
import { useDebounce } from 'use-debounce';
/*import { ApexOptions } from 'apexcharts';
import { merge } from 'lodash';
import { ColorSchema } from 'src/theme/palette';
*/
// ----------------------------------------------------------------------

const PAGE_SIZE = 100;

const TABLE_HEAD = [
  { id: 'description', label: 'Description', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'right', width: 180 },
  { id: 'date', label: 'Date', align: 'left', width: 140 },
  { id: 'classification', label: 'Classification', align: 'center', width: 240 },
  { id: 'tags', label: 'Tags', align: 'left' },
  { id: '' },
];

interface RowIdCallbackFunction {
  (id: string): void;
}

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
  tags: ITag[];
};

type ITag = {
  name: String;
};

type IBasicAccount = {
  id: string;
  name: string;
};

const updateTransactionTagsQuery = gql(`
mutation updateTransactionTags(
  $force:Boolean!, 
  $addTags:[String!]!, 
  $removeTags:[String!]!, 
  $transactionIds:[String!]!
) {
  updateTransactionTags(
    force: $force, 
    addTags: $addTags, 
    removeTags: $removeTags, 
    transactionIds: $transactionIds
  ) {
    id
    tags {
      name
    }
  }
}`);

const tagsQuery = gql(`query getTags {
  tags {
    name
  }
}`);

const accountsQuery = gql(`query getAccounts {
  getAccounts {
    id
    name
  }
}`);

const transactionsQuery = gql(`
query getBasicTransactions($accountId: String, $limit: Int, $offset: Int) {
  getTransactions(accountId: $accountId, limit: $limit, after: $offset) {
    __typename
    ...on Transaction {
      ...CoreTransactionParts
      account {
        id
        name
      }
      tags {
        name
      }
    }
    ...on BackfilledTransaction {
      ...CoreBackfilledTransactionParts
      account {
        id
        name
      }
      tags {
        name
      }
    }
    ... on InvestmentTransaction {
      ...CoreInvestmentTransactionParts
      account {
        id
        name
      }
      tags {
        name
      }
    }
  }
}

fragment CoreTransactionParts on Transaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}

fragment CoreBackfilledTransactionParts on BackfilledTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}

fragment CoreInvestmentTransactionParts on InvestmentTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}`);

const Classifications = ['Duplicate', 'Income', 'Expense', 'Recurring', 'Transfer', 'Investment'];

// ----------------------------------------------------------------------

export default function Transactions() {
  const FETCH_LIMIT = PAGE_SIZE;
  const [offset, setOffset] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<IBasicAccount[]>([]);

  const [refetch, additionalTransactions] = useLazyQuery(transactionsQuery);
  const [fetchTags, fetchTagResponse] = useLazyQuery(tagsQuery);
  const [fetchAccounts, fetchAccountsResponse] = useLazyQuery(accountsQuery);

  const [updateTransactionTags, updateTransactionTagsResult] = useMutation(
    updateTransactionTagsQuery
  );

  const [modifiedTags, setModifiedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!fetchTagResponse?.loading) {
      fetchTags({
        fetchPolicy: 'no-cache',
      });
    }
    if (!fetchAccountsResponse?.loading) {
      fetchAccounts();
    }
  }, []);

  useEffect(() => {
    setTags(Object.values(fetchTagResponse?.data?.tags ?? {}).map((t) => t.name));
  }, [fetchTagResponse.data]);

  useEffect(() => {
    setAccounts((fetchAccountsResponse?.data?.getAccounts ?? []) as IBasicAccount[]);
  }, [fetchTagResponse.data]);

  const fetchMoreTransacitons = useCallback(() => {
    if (additionalTransactions.loading) {
      return;
    }

    refetch({
      variables: {
        offset: offset,
        limit: PAGE_SIZE,
      },
      fetchPolicy: 'no-cache',
    });

    setOffset(offset + FETCH_LIMIT);
  }, [refetch, offset, additionalTransactions.loading]);

  const extractTransactions = useCallback(
    (queryResultData: GetBasicTransactionsQuery | undefined): IBasicTransaction[] => {
      const maybedata = queryResultData?.getTransactions as unknown[] | null;
      const transactionData = (maybedata ?? []) as IBasicTransaction[];
      return transactionData;
    },
    []
  );

  useEffect(() => {
    let transactionData = extractTransactions(additionalTransactions.data);
    setTableData([...tableData, ...transactionData]);
  }, [additionalTransactions.data]);

  const { themeStretch } = useSettingsContext();
  const navigate = useNavigate();

  const {
    safe,
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
    onChangeSafe,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultRowsPerPage: PAGE_SIZE, defaultOrderBy: 'createDate' });

  const saveChanges = useCallback(async () => {
    await updateTransactionTags({
      variables: {
        force: false,
        addTags: modifiedTags,
        removeTags: [],
        transactionIds: selected,
      },
    });
    await fetchTags({
      fetchPolicy: 'no-cache',
    });
  }, [updateTransactionTags, selected, modifiedTags]);

  const [tableData, setTableData] = useState<IBasicTransaction[]>([]);
  const [filteredData, setFilteredData] = useState<IBasicTransaction[]>([]);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterDescription, setFilterDescription] = useState('');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterClassification, setFilterClassification] = useState('all');
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);

  const [debounceFilterDescription] = useDebounce(filterDescription, 250);

  useEffect(() => {
    const dataFiltered = applyFilter({
      inputData: tableData,
      comparator: getComparator(order, orderBy),
      filterDescription,
      filterClassification,
      filterStartDate,
      filterEndDate,
      filterAccount,
    });
    if (dataFiltered.length < 100) {
      fetchMoreTransacitons();
    }

    setFilteredData(dataFiltered);
  }, [
    tableData,
    filterAccount,
    filterClassification,
    debounceFilterDescription,
    filterStartDate,
    filterEndDate,
  ]);

  const handleEditRow = useCallback((id: string) => {
    //navigate(PATH_DASHBOARD.transaction.edit(id));
  }, []);

  const handleViewRow = useCallback(
    (id: string) => {
      navigate(PATH_DASHBOARD.transactions.view(id));
    },
    [navigate]
  );

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row: { id: string }) => row.id !== id);
      setSelected([]);
      setTableData(deleteRow);

      if (page > 0) {
        if (dataInPage.length < 2) {
          setPage(page - 1);
        }
      }
    },
    [setSelected, setTableData, tableData, setPage]
  );

  const dataInPage = useMemo(
    () =>
      filteredData
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row) => (
          <TransactionTableRow
            key={row.id}
            row={row}
            safe={safe}
            selected={selected.includes(row.id)}
            onSelectRow={onSelectRow}
            onViewRow={handleViewRow}
            onEditRow={handleEditRow}
            onDeleteRow={handleDeleteRow}
          />
        )),
    [
      filteredData,
      page,
      rowsPerPage,
      safe,
      selected,
      onSelectRow,
      handleViewRow,
      handleEditRow,
      handleDeleteRow,
    ]
  );

  const denseHeight = dense ? 56 : 76;

  const isFiltered =
    filterClassification !== 'all' ||
    filterDescription !== '' ||
    filterAccount !== 'all' ||
    (!!filterStartDate && !!filterEndDate);

  const isNotFound =
    (!filteredData.length && !!filterDescription) ||
    (!filteredData.length && !!filterClassification) ||
    (!filteredData.length && !!filterEndDate) ||
    (!filteredData.length && !!filterStartDate);

  const handleOpenConfirm = useCallback(() => {
    setOpenConfirm(true);
  }, [setOpenConfirm]);

  const handleCloseConfirm = useCallback(() => {
    setOpenConfirm(false);
  }, [setOpenConfirm]);

  const handleFilterClassification = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPage(0);
      setFilterClassification(event.target.value);
    },
    [setPage, setFilterClassification]
  );

  const handleFilterDescription = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPage(0);
      setFilterDescription(event.target.value);
    },
    [setPage, setFilterDescription]
  );

  const handleFilterAccount = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPage(0);
      setFilterAccount(event.target.value);
    },
    [setPage, setFilterAccount]
  );

  const handleDeleteRows = useCallback((selected: string[]) => {
    const deleteRows = tableData.filter((row: { id: string }) => !selected.includes(row.id));
    setSelected([]);
    setTableData(deleteRows);

    if (page > 0) {
      if (selected.length === dataInPage.length) {
        setPage(page - 1);
      } else if (selected.length === filteredData.length) {
        setPage(0);
      } else if (selected.length > dataInPage.length) {
        const newPage = Math.ceil((tableData.length - selected.length) / rowsPerPage) - 1;
        setPage(newPage);
      }
    }
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilterDescription('');
    setFilterClassification('all');
    setFilterAccount('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  }, [
    setFilterAccount,
    setFilterClassification,
    setFilterDescription,
    setFilterStartDate,
    setFilterEndDate,
  ]);

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
              to={PATH_DASHBOARD.transactions.list /*.transaction.new*/}
              component={RouterLink}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Transaction
            </Button>
          }
        />
        {/*
        <BankingWidgetSummary
          title="Income"
          icon="eva:diagonal-arrow-left-down-fill"
          percent={2.6}
          total={18765}
          chart={{
            series: [
              12474.02, 0.59, 0.06, 8893.79, 61588.28, 110345.13, 47687.76, 60570.56, 48061.41,
              14744.27, 288834.6, 45590.2, 7644.64, 17384.07, 133094.92, 59151.68, 40425.18,
              50818.72, 62334.44, 33409.89, 87017.17, 379644.91, 121946.08, 55377.55, 84825.88,
              137792.25, 35487.23, 13442.93,
            ],
          }}
        />

        <BankingWidgetSummary
          title="Expenses"
          color="warning"
          icon="eva:diagonal-arrow-right-up-fill"
          percent={-0.5}
          total={8938}
          chart={{
            series: [111, 136, 76, 108, 74, 54, 57, 84],
          }}
        /> */}

        <Card sx={{ marginBottom: 2 }}>
          <Stack
            spacing={2}
            alignItems="center"
            direction={{
              xs: 'column',
              md: 'row',
            }}
            sx={{ px: 2.5, py: 3 }}
          >
            <Autocomplete
              sx={{ width: '400px' }}
              multiple
              freeSolo
              onChange={(event, newValue) => setModifiedTags(newValue)}
              options={tags.map((option) => option)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option} size="small" label={option} />
                ))
              }
              renderInput={(params) => <TextField label="Tags" {...params} />}
            />

            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:save-outline" />}
              onClick={saveChanges}
            >
              Save{selected.length > 0 ? ` (${selected.length})` : ''}
            </Button>
          </Stack>
        </Card>

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
                  filteredData.map((row: { id: any }) => row.id)
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
                      filteredData.map((row: { id: any }) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataInPage}
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
            count={filteredData.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            //
            dense={dense}
            onChangeDense={onChangeDense}
            safe={safe}
            onChangeSafe={onChangeSafe}
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
    inputData = inputData.filter((transaction) => transaction.account.name === filterAccount);
  }

  if (filterClassification !== 'all') {
    inputData = inputData.filter(
      (transaction) => transaction.classification === filterClassification
    );
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
          key={'all'}
          value={'all'}
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
          key={'all'}
          value={'all'}
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
          return (
            <TextField
              {...params}
              fullWidth
              sx={{
                maxWidth: { md: INPUT_WIDTH },
              }}
            />
          );
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
  safe,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}: {
  row: IBasicTransaction;
  safe: boolean;
  selected: boolean;
  onSelectRow: RowIdCallbackFunction;
  onViewRow: RowIdCallbackFunction;
  onEditRow: RowIdCallbackFunction;
  onDeleteRow: RowIdCallbackFunction;
}) {
  const { id, date, description, amount, tags, classification } = row;

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

  console.dir('render row');

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={() => onSelectRow(id)} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CustomAvatar name={description} />

            <Link
              onClick={() => onViewRow(id)}
              sx={{
                color: 'text.disabled',
                cursor: 'pointer',
                ':hover': {
                  textDecoration: 'none',
                },
              }}
            >
              <div>
                <Typography variant="subtitle2" noWrap color="MenuText">
                  {description}
                </Typography>

                <Typography noWrap variant="body2">
                  {row.account.name}
                </Typography>
              </div>
            </Link>
          </Stack>
        </TableCell>

        <TableCell align="right">
          <Typography
            fontFamily="Menlo"
            color={amount > 0 ? '#36B37E' : '#FF5630'}
            fontWeight="bold"
          >
            {safe ? 'X,XXX.XX' : fCurrency(Math.abs(amount), true)}
          </Typography>
        </TableCell>

        <TableCell align="left">{fDate(date)}</TableCell>

        <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
          {classification !== null ? (
            <Label
              variant="soft"
              color={
                (classification === 'Expense' && 'error') ||
                (classification === 'Income' && 'success') ||
                (classification === 'Duplicate' && 'secondary') ||
                (classification === 'Recurring' && 'warning') ||
                (classification === 'Transfer' && 'secondary') ||
                (classification === 'Investment' && 'primary') ||
                (classification === 'Hidden' && 'secondary') ||
                'default'
              }
            >
              {classification}
            </Label>
          ) : null}
        </TableCell>

        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {tags.map((tag, index) => (
            <Chip
              key={index}
              size={'small'}
              label={tag.name}
              sx={{ marginRight: 1, borderRadius: 1 }}
            />
          ))}
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
            onViewRow(id);
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:eye-fill" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow(id);
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
          <Button variant="contained" color="error" onClick={() => onDeleteRow(id)}>
            Delete
          </Button>
        }
      />
    </>
  );
}
/*
// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  percent: number;
  color?: ColorSchema;
  icon: string;
  chart: {
    series: number[];
    options?: ApexOptions;
  };
}

function BankingWidgetSummary({
  title,
  total,
  icon,
  percent,
  color = 'primary',
  chart,
  sx,
  ...other
}: Props) {
  const theme = useTheme();

  const { series, options } = chart;

  const chartOptions = useChart({
    colors: [theme.palette[color].main],
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    xaxis: {
      labels: { show: false },
    },
    yaxis: {
      labels: { show: false },
    },
    stroke: {
      width: 4,
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (value: number) => fCurrency(value),
        title: {
          formatter: () => '',
        },
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.56,
        opacityTo: 0.56,
      },
    },
    ...options,
  });

  return (
    <Card
      sx={{
        width: 1,
        boxShadow: 0,
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => theme.palette[color].lighter,
        ...sx,
      }}
      {...other}
    >
      <Iconify
        icon={icon}
        sx={{
          p: 1.5,
          top: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          position: 'absolute',
          color: (theme) => theme.palette[color].lighter,
          bgcolor: (theme) => theme.palette[color].dark,
        }}
      />

      <Stack spacing={1} sx={{ p: 3 }}>
        <Typography variant="subtitle2">{title}</Typography>

        <Typography variant="h3">{fCurrency(total)}</Typography>

        <TrendingInfo percent={percent} />
      </Stack>

      <Chart type="area" series={[{ data: series }]} options={chartOptions} height={120} />
    </Card>
  );
}

// ----------------------------------------------------------------------

type TrendingInfoProps = {
  percent: number;
};

function TrendingInfo({ percent }: TrendingInfoProps) {
  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={0.5}>
      <Iconify icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'} />

      <Typography variant="subtitle2" component="span">
        {percent > 0 && '+'}

        {fPercent(percent)}

        <Box component="span" sx={{ opacity: 0.72, typography: 'body2' }}>
          {' than last month'}
        </Box>
      </Typography>
    </Stack>
  );
}

function useChart(options?: ApexOptions) {
  const theme = useTheme();

  const LABEL_TOTAL = {
    show: true,
    label: 'Total',
    color: theme.palette.text.secondary,
    fontSize: theme.typography.subtitle2.fontSize as string,
    fontWeight: theme.typography.subtitle2.fontWeight,
    lineHeight: theme.typography.subtitle2.lineHeight,
  };

  const LABEL_VALUE = {
    offsetY: 8,
    color: theme.palette.text.primary,
    fontSize: theme.typography.h3.fontSize as string,
    fontWeight: theme.typography.h3.fontWeight,
    lineHeight: theme.typography.h3.lineHeight,
  };

  const baseOptions = {
    // Colors
    colors: [
      theme.palette.primary.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
      theme.palette.success.main,
      theme.palette.warning.dark,
      theme.palette.success.darker,
      theme.palette.info.dark,
      theme.palette.info.darker,
    ],

    // Chart
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      // animations: { enabled: false },
      foreColor: theme.palette.text.disabled,
      fontFamily: theme.typography.fontFamily,
    },

    // States
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.04,
        },
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.88,
        },
      },
    },

    // Fill
    fill: {
      opacity: 1,
      gradient: {
        type: 'vertical',
        shadeIntensity: 0,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100],
      },
    },

    // Datalabels
    dataLabels: { enabled: false },

    // Stroke
    stroke: {
      width: 3,
      curve: 'smooth',
      lineCap: 'round',
    },

    // Grid
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
    },

    // Xaxis
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    // Markers
    markers: {
      size: 0,
      strokeColors: theme.palette.background.paper,
    },

    // Tooltip
    tooltip: {
      x: {
        show: false,
      },
    },

    // Legend
    legend: {
      show: true,
      fontSize: String(13),
      position: 'top',
      horizontalAlign: 'right',
      markers: {
        radius: 12,
      },
      fontWeight: 500,
      itemMargin: { horizontal: 12 },
      labels: {
        colors: theme.palette.text.primary,
      },
    },

    // plotOptions
    plotOptions: {
      // Bar
      bar: {
        borderRadius: 4,
        columnWidth: '28%',
      },

      // Pie + Donut
      pie: {
        donut: {
          labels: {
            show: true,
            value: LABEL_VALUE,
            total: LABEL_TOTAL,
          },
        },
      },

      // Radialbar
      radialBar: {
        track: {
          strokeWidth: '100%',
          background: alpha(theme.palette.grey[500], 0.16),
        },
        dataLabels: {
          value: LABEL_VALUE,
          total: LABEL_TOTAL,
        },
      },

      // Radar
      radar: {
        polygons: {
          fill: { colors: ['transparent'] },
          strokeColors: theme.palette.divider,
          connectorColors: theme.palette.divider,
        },
      },

      // polarArea
      polarArea: {
        rings: {
          strokeColor: theme.palette.divider,
        },
        spokes: {
          connectorColors: theme.palette.divider,
        },
      },
    },

    // Responsive
    responsive: [
      {
        // sm
        breakpoint: theme.breakpoints.values.sm,
        options: {
          plotOptions: { bar: { columnWidth: '40%' } },
        },
      },
      {
        // md
        breakpoint: theme.breakpoints.values.md,
        options: {
          plotOptions: { bar: { columnWidth: '32%' } },
        },
      },
    ],
  };

  return merge(baseOptions, options);
}
*/
