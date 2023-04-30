import { Helmet } from 'react-helmet-async';
import { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { GetBasicTransactionsQuery, TransactionClassification } from 'src/__generated__/graphql';
import { useDebounce } from 'use-debounce';
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

const updateTransactionClassificationQuery = gql(`
mutation updateClassification(
  $transactionIds: [String!]!, 
  $classification: TransactionClassification!) {
  updateTransactionClassification(
    transactionIds: $transactionIds,
    classification: $classification) {
    id
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

const Classifications = [
  'Duplicate',
  'Income',
  'Expense',
  'Recurring',
  'Transfer',
  'Investment',
  'Hidden',
];

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
  const [updateTransactionClassification, updateTransactionClassificationResult] = useMutation(
    updateTransactionClassificationQuery
  );

  const [modifiedTags, setModifiedTags] = useState<string[]>([]);
  const [modifiedClassification, setModifiedClassification] = useState<string | null>(null);

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
    if (!!modifiedTags.length) {
      await updateTransactionTags({
        variables: {
          force: false,
          addTags: modifiedTags,
          removeTags: [],
          transactionIds: selected,
        },
      });
    }
    if (!!modifiedClassification) {
      await updateTransactionClassification({
        variables: {
          transactionIds: selected,
          classification: modifiedClassification as TransactionClassification,
        },
      });
    }
    await fetchTags({
      fetchPolicy: 'no-cache',
    });
    setSelected([]);
  }, [
    setSelected,
    updateTransactionTags,
    updateTransactionClassification,
    modifiedClassification,
    selected,
    modifiedTags,
  ]);

  const [tableData, setTableData] = useState<IBasicTransaction[]>([]);
  const [filteredData, setFilteredData] = useState<IBasicTransaction[]>([]);

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
          />
        )),
    [filteredData, page, rowsPerPage, safe, selected, onSelectRow, handleViewRow, handleEditRow]
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

  const handleFilterClassification = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPage(0);
      setFilterClassification(event.target.value);
    },
    [setPage, setFilterClassification]
  );

  const handleModifyClassification = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setModifiedClassification(event.target.value);
    },
    [setModifiedClassification]
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

  const handleDeleteRows = useCallback(() => {
    // TODO
  }, [selected]);

  const handleInvertRows = useCallback(() => {
    // TODO
  }, [selected]);

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
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    size="small"
                    label={option}
                    sx={{ marginRight: 1, borderRadius: 1 }}
                  />
                ))
              }
              renderInput={(params) => <TextField label="Tags" {...params} />}
            />

            <TextField
              fullWidth
              select
              label="Classification type"
              value={modifiedClassification}
              onChange={handleModifyClassification}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { maxHeight: 240 },
                  },
                },
              }}
              sx={{
                maxWidth: { md: '250px' },
                textTransform: 'capitalize',
              }}
            >
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

            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:save-outline" />}
              onClick={saveChanges}
              size="large"
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
                  <Tooltip title="Clear Classification">
                    <IconButton color="primary">
                      <Iconify icon="eva:slash-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Invert Amount">
                    <IconButton color="primary" onClick={handleInvertRows}>
                      <Iconify icon="eva:flip-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={handleDeleteRows}>
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
}: {
  row: IBasicTransaction;
  safe: boolean;
  selected: boolean;
  onSelectRow: RowIdCallbackFunction;
  onViewRow: RowIdCallbackFunction;
  onEditRow: RowIdCallbackFunction;
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
                <Typography variant="subtitle2" noWrap color="MenuText" sx={{ color: '#FFF' }}>
                  {description}
                </Typography>

                <Typography noWrap variant="body2" sx={{ color: '#919eab' }}>
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
      </MenuPopover>
    </>
  );
}
