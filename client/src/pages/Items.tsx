import { Helmet } from 'react-helmet-async';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
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
} from '@mui/material';
// routes
//import { PATH_DASHBOARD } from '../routes/paths';
// utils
import { fDate } from '../utils/formatTime';

// components
//import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
//import CustomBreadcrumbs from '../components/custom-breadcrumbs';
import { useSettingsContext } from '../components/settings';
import {
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
  useTable,
} from '../components/table';
// sections
import DatePicker from '@mui/lab/DatePicker/DatePicker';
import MenuPopover from 'src/components/menu-popover';
import { CustomAvatar } from 'src/components/custom-avatar';
import { fCurrency } from 'src/utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from 'src/components/confirm-dialog';

import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { gql } from 'src/__generated__/gql';
import Label from 'src/components/label';
import { PlaidLinkResponse } from 'src/__generated__/graphql';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { usePlaidLink } from 'react-plaid-link';

// ----------------------------------------------------------------------

const SERVICE_OPTIONS = ['all', 'active', 'inactive', 'stale'];

const TABLE_HEAD = [
  { id: 'accountName', label: 'Account', align: 'left' },
  { id: 'lastUpdated', label: 'Latest Transaction', align: 'left' },
  { id: 'balance', label: 'Balance', align: 'right', width: 140 },
  { id: 'status', label: 'Status', align: 'center' },
  { id: '' },
];

type IItem = {
  id: string;
  accounts: Array<IAccount>;
};

type IAccount = {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  status: string;
  officialName: string;
  currency: string;
  totalTransactions: number;
  latestBalance: IBalance;
  latestTransaction: ITransaction | null;
  institution: IInstitution;
};

type IBalance = {
  balanceCents: number;
  limitCents: number;
  lastUpdateDate: string;
  availableCents: number;
};

type ITransaction = {
  date: string;
};

type IInstitution = {
  id: string;
  url: string | null;
  name: string;
  logo: string | null;
  products: string;
  countryCodes: string;
  primaryColor: string;
};

const query = gql(`
query getItems {
  getItems {
    id
    accounts {
      ...AccountParts
      latestBalance {
        ...BalanceParts
      }
      latestTransaction {
        date
      }
      institution {
        ...InstitutionParts
      }
    }
  }
}

fragment AccountParts on Account {
  id
  name
  mask
  type
  subtype
  officialName
  status
  currency
  totalTransactions
}

fragment BalanceParts on AccountBalance {
  balanceCents
  limitCents
  lastUpdateDate
  availableCents
}

fragment InstitutionParts on Institution {
  id
  url
  name
  logo
  products
  countryCodes
  primaryColor
}
`);

const getLinkTokenQuery = gql(`
query getToken {
  getLinkToken {
    token
    error
  }
}
`);

const getLinkTokenForAccountQuery = gql(`
query getLinkTokenForAccountQuery($accountId:String!) {
  getLinkTokenForAccount(accountId:$accountId) {
    token
  }
}`);

const setLinkResponse = gql(`
mutation setPlaidLinkResponse($plaidLinkResponse: PlaidLinkResponse!) {
  setPlaidLinkResponse(plaidLinkResponse: $plaidLinkResponse) {
    id 
    institutionId
  }
}
`);

const deleteAccountMutation = gql(`
mutation deletAccount($accountId: String!) {
  deleteAccount(accountId: $accountId) 
}`);

// ----------------------------------------------------------------------

export default function ItemsPage() {
  const theme = useTheme();

  const { loading, data, refetch } = useQuery(query);
  const [token, setToken] = useState<string | null>(null);
  const [getLinkToken, gltResponse] = useLazyQuery(getLinkTokenQuery);
  const [getLinkTokenForAccount, gltfaResponse] = useLazyQuery(getLinkTokenForAccountQuery);
  const [setPlaidLinkResponse] = useMutation<PlaidLinkResponse>(setLinkResponse);
  const [deleteAccount] = useMutation(deleteAccountMutation);

  const { open, ready } = usePlaidLink({
    token: token,
    onSuccess: (public_token, metadata) => {
      setPlaidLinkResponse({
        variables: {
          plaidLinkResponse: {
            publicToken: public_token,
            linkSessionId: metadata.link_session_id,
            institutionId: metadata.institution?.institution_id,
          },
        },
      });
      setToken(null);
    },
  });

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  useEffect(() => {
    setToken(gltResponse.data?.getLinkToken?.token ?? null);
  }, [setToken, gltResponse]);

  useEffect(() => {
    setToken(gltfaResponse.data?.getLinkTokenForAccount?.token ?? null);
  }, [setToken, gltfaResponse]);

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
  } = useTable();

  const [tableData, setTableData] = useState([] as IAccount[]);

  useEffect(() => {
    const maybedata = (data?.getItems as IItem[] | null)?.map((item) => item.accounts).flat(1);
    setTableData((maybedata ?? []) as IAccount[]);
  }, [data]);

  const [filterName, setFilterName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterService, setFilterService] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterService,
    filterStatus,
    filterStartDate,
    filterEndDate,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 56 : 76;

  const isFiltered =
    filterStatus !== 'all' ||
    filterName !== '' ||
    filterService !== 'all' ||
    (!!filterStartDate && !!filterEndDate);

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterStatus) ||
    (!dataFiltered.length && !!filterService) ||
    (!dataFiltered.length && !!filterEndDate) ||
    (!dataFiltered.length && !!filterStartDate);
  /*

  const getLengthByStatus = (status: string) =>
    tableData.filter((item: { status: string }) => item.status === status).length;

  const getTotalPriceByStatus = (status: string) =>
    sumBy(
      tableData.filter((item: { status: string }) => item.status === status),
      'totalPrice'
    );

  const getPercentByStatus = (status: string) =>
    (getLengthByStatus(status) / tableData.length) * 100; 

  const TABS = [
    { value: 'all', label: 'All', color: 'info', count: tableData.length },
    { value: 'paid', label: 'Paid', color: 'success', count: getLengthByStatus('paid') },
    { value: 'unpaid', label: 'Unpaid', color: 'warning', count: getLengthByStatus('unpaid') },
    { value: 'overdue', label: 'Overdue', color: 'error', count: getLengthByStatus('overdue') },
    { value: 'draft', label: 'Draft', color: 'default', count: getLengthByStatus('draft') },
  ] as const; */

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterService = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const handleDeleteRow = async (id: string) => {
    let didDelete = await deleteAccount({ variables: { accountId: id } });
    if (didDelete) {
      await refetch();
      setSelected([]);
      if (page > 0) {
        if (dataInPage.length < 2) {
          setPage(page - 1);
        }
      }
    }
  };

  const handleDeleteRows = (selected: string[]) => {
    // TODO
  };

  const handleEditRow = (id: string) => {
    //navigate(PATH_DASHBOARD.invoice.edit(id));
  };

  const handleViewRow = useCallback(
    (id: string) => {
      navigate(PATH_DASHBOARD.accounts.view(id));
    },
    [navigate]
  );

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterService('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  return (
    <>
      <Helmet>
        <title>Items</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Invoice List"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Accounts',
              href: '', //PATH_DASHBOARD.invoice.root,
            },
            {
              name: 'List',
            },
          ]}
          action={
            <Button
              onClick={() => {
                getLinkToken();
              }}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Link Account
            </Button>
          }
        />

        <Card>
          <InvoiceTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            filterService={filterService}
            filterEndDate={filterEndDate}
            onFilterName={handleFilterName}
            optionsService={SERVICE_OPTIONS}
            onResetFilter={handleResetFilter}
            filterStartDate={filterStartDate}
            onFilterService={handleFilterService}
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
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onFixLink={() =>
                          getLinkTokenForAccount({
                            variables: {
                              accountId: row.id,
                            },
                          })
                        }
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
  filterName,
  filterStatus,
  filterService,
  filterStartDate,
  filterEndDate,
}: {
  inputData: IAccount[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterStatus: string;
  filterService: string;
  filterStartDate: Date | null;
  filterEndDate: Date | null;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (account) =>
        account.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        account.mask.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  /*
  if (filterStatus !== 'all') {
        inputData = inputData.filter((invoice) => invoice.status === filterStatus);
  } */

  if (filterService !== 'all') {
    inputData = inputData.filter((account) => account.status === filterService);
  }

  /*
  if (filterStartDate && filterEndDate) {
        inputData = inputData.filter(
          (invoice) =>
            fTimestamp(invoice.createDate) >= fTimestamp(filterStartDate) &&
            fTimestamp(invoice.createDate) <= fTimestamp(filterEndDate)
        );
  }*/

  return inputData;
}

const INPUT_WIDTH = 160;

function InvoiceTableToolbar({
  filterName,
  isFiltered,
  onFilterName,
  filterEndDate,
  filterService,
  onResetFilter,
  optionsService,
  filterStartDate,
  onFilterService,
  onFilterEndDate,
  onFilterStartDate,
}: {
  filterName: string;
  isFiltered: boolean;
  filterService: string;
  optionsService: string[];
  filterEndDate: Date | null;
  onResetFilter: VoidFunction;
  filterStartDate: Date | null;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterService: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
        label="Service type"
        value={filterService}
        onChange={onFilterService}
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
        {optionsService.map((option) => (
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

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search account name..."
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

function InvoiceTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onFixLink,
}: {
  row: IAccount;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onFixLink: VoidFunction;
}) {
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
            <CustomAvatar
              src={`data:image/png;base64,${row.institution.logo}`}
              name={row.institution.name}
            />

            <Link
              noWrap
              variant="body2"
              onClick={onViewRow}
              sx={{ color: 'text.disabled', cursor: 'pointer' }}
            >
              <div>
                <Typography variant="subtitle2" noWrap color="MenuText" sx={{ color: '#FFF' }}>
                  {row.name}
                </Typography>

                {`...${row.mask}`}
              </div>
            </Link>
          </Stack>
        </TableCell>

        <TableCell align="left">{fDate(row.latestTransaction?.date ?? '')}</TableCell>

        <TableCell align="right">{fCurrency(row.latestBalance.balanceCents)}</TableCell>

        <TableCell align="left">
          <Label
            variant="soft"
            color={
              (row.status === 'active' && 'success') ||
              (row.status === 'stale' && 'warning') ||
              (row.status === 'inactive' && 'default') ||
              (row.status === 'error' && 'error') ||
              'default'
            }
          >
            {row.status}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton color="default" onClick={onFixLink}>
            <Iconify icon="eva:refresh-outline" />
          </IconButton>
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
