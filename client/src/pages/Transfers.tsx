import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';

import {
  Card,
  Table,
  Stack,
  Button,
  TableBody,
  Container,
  TableContainer,
  TextField,
  MenuItem,
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
import { fDate } from '../utils/formatTime';

// components
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
import { CustomAvatar } from 'src/components/custom-avatar';
import { fCurrency } from 'src/utils/formatNumber';
import { useMutation, useQuery } from '@apollo/client';
import { UnsavedTransfer } from 'src/__generated__/graphql';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'from', label: 'From', align: 'left' },
  { id: 'to', label: 'To', align: 'left' },
  { id: 'date', label: 'Date', align: 'center', width: 140 },
  { id: 'amount', label: 'Amount', align: 'center', width: 140 },
];

type ITransfer = {
  date: string;
  amountCents: number;
  to: IBasicTransaction;
  from: IBasicTransaction;
};

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
  mask: string;
  institution: IInstitution;
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

const getPossibleTransfersQuery = gql(`
query getPossibleTransfers {
  getPossibleTransfers {
    date
    amountCents
    to {
  		...parts
      account {
        id
        name
        mask
        institution {
          id
          name
          logo
          primaryColor
        }
      }
  	}
    from {
      ...parts
      account {
        id
        name
        mask
        institution {
          id
          name
          logo
          primaryColor
        }
      }
		}
  }
}

fragment parts on CoreTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}`);

const saveTransfersMutationGQL = gql(`
mutation saveTransfers($transfers: [UnsavedTransfer!]!) {
  saveTransfers(transfers:$transfers) {
    to {
      ...parts
    }
    from {
      ...parts
    }
  }
}`);

// ----------------------------------------------------------------------

export default function Transfers() {
  const { loading, data, refetch } = useQuery(getPossibleTransfersQuery);
  const [saveTransfersMutation, saveTransfersResult] = useMutation(saveTransfersMutationGQL);

  useEffect(() => {
    const maybedata = data?.getPossibleTransfers as unknown[] | null;
    const transferData = (maybedata ?? []) as ITransfer[];

    if (maybedata) {
      const accounts = transferData.reduce(
        (accounts: { [key: string]: IBasicAccount }, transfer) => {
          if (!accounts[transfer.to.accountId]) {
            accounts[transfer.to.accountId] = transfer.to.account;
          }

          if (!accounts[transfer.from.accountId]) {
            accounts[transfer.from.accountId] = transfer.from.account;
          }
          return accounts;
        },
        {}
      );

      const institutions = Object.values(accounts).reduce(
        (institutions: { [key: string]: IInstitution }, account) => {
          if (!institutions[account.institution.id]) {
            institutions[account.institution.id] = account.institution;
          }
          return institutions;
        },
        {}
      );

      setTableData(transferData);
      setAccounts(Object.values(accounts));
      setInstitutions(Object.values(institutions));
    }
  }, [data]);

  const saveTransfers = async () => {
    let transfers: UnsavedTransfer[] = selected.map((transferId) => {
      return {
        toId: transferId.split('__')[0],
        fromId: transferId.split('__')[1],
      } as UnsavedTransfer;
    });
    console.dir({ variables: { transfers } });

    await saveTransfersMutation({ variables: { transfers } });
    await refetch();
    onSelectAllRows(false, []); // clear selection
  };

  const { themeStretch } = useSettingsContext();

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultRowsPerPage: 50, defaultOrderBy: 'createDate' });

  const [tableData, setTableData] = useState<ITransfer[]>([]);
  const [accounts, setAccounts] = useState<IBasicAccount[]>([]);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);

  const [filterAccount, setFilterAccount] = useState('all');
  const [filterDescription, setFilterDescription] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('all');

  const handleFilterDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterDescription(event.target.value);
  };

  const handleFilterAccount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterAccount(event.target.value);
  };

  const handleFilterInstitution = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterInstitution(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterAccount('all');
    setFilterDescription('');
    setFilterInstitution('all');
  };

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterAccount,
    filterDescription,
    filterInstitution,
  });

  const isFiltered =
    filterInstitution !== 'all' || filterDescription !== '' || filterAccount !== 'all';
  const isNotFound = !dataFiltered.length && isFiltered;

  const denseHeight = dense ? 56 : 76;

  return (
    <>
      <Helmet>
        <title> Transaction: Transfers | Minimal UI</title>
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
              variant="contained"
              startIcon={<Iconify icon="material-symbols:save" />}
              onClick={saveTransfers}
              disabled={selected.length === 0}
            >
              Save Transfers
            </Button>
          }
        />

        <Card>
          <TransferTableToolbar
            accounts={accounts}
            institutions={institutions}
            filterAccount={filterAccount}
            filterDescription={filterDescription}
            filterInstitution={filterInstitution}
            isFiltered={isFiltered}
            onResetFilter={handleResetFilter}
            onFilterAccount={handleFilterAccount}
            onFilterDescription={handleFilterDescription}
            onFilterInstitution={handleFilterInstitution}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={dense}
              numSelected={selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked: any) =>
                onSelectAllRows(
                  checked,
                  dataFiltered.map((row: ITransfer) => `${row.to.id}__${row.from.id}`)
                )
              }
            />

            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked: any) =>
                    onSelectAllRows(
                      checked,
                      dataFiltered.map((row: ITransfer) => `${row.to.id}__${row.from.id}`)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TransferTableRow
                        key={`${row.to.id}__${row.from.id}`}
                        row={row}
                        selected={selected.includes(`${row.to.id}__${row.from.id}`)}
                        onSelectRow={() => onSelectRow(`${row.to.id}__${row.from.id}`)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                  />

                  <TableNoData isNotFound={loading || isNotFound} />
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
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterDescription,
  filterAccount,
  filterInstitution,
}: {
  inputData: ITransfer[];
  comparator: (a: any, b: any) => number;
  filterDescription: string;
  filterInstitution: string;
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
      (transfer) =>
        transfer.to.description.toLowerCase().indexOf(filterDescription.toLowerCase()) !== -1 ||
        transfer.from.description.toLowerCase().indexOf(filterDescription.toLowerCase()) !== -1
    );
  }

  if (filterAccount !== 'all') {
    inputData = inputData.filter(
      (transfer) =>
        transfer.to.account.name === filterAccount || transfer.from.account.name === filterAccount
    );
  }

  if (filterInstitution !== 'all') {
    inputData = inputData.filter(
      (transfer) =>
        transfer.to.account.institution.name === filterInstitution ||
        transfer.from.account.institution.name === filterInstitution
    );
  }

  return inputData;
}

function TransferTableToolbar({
  accounts,
  institutions,
  filterAccount,
  filterDescription,
  filterInstitution,
  isFiltered,
  onResetFilter,
  onFilterAccount,
  onFilterDescription,
  onFilterInstitution,
}: {
  accounts: IBasicAccount[];
  institutions: IInstitution[];
  filterDescription: string;
  filterInstitution: string;
  filterAccount: string;
  isFiltered: boolean;
  onResetFilter: VoidFunction;
  onFilterAccount: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterDescription: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterInstitution: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
          maxWidth: { md: 160 },
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
        label="Institutions"
        value={filterInstitution}
        onChange={onFilterInstitution}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 220 },
            },
          },
        }}
        sx={{
          maxWidth: { md: 160 },
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
        {institutions.map((option) => (
          <MenuItem
            key={option.id}
            value={option.name}
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
            {option.name}
          </MenuItem>
        ))}
      </TextField>

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

function TransferTableRow({
  row,
  selected,
  onSelectRow,
}: {
  row: ITransfer;
  selected: boolean;
  onSelectRow: VoidFunction;
}) {
  const { date, to, from } = row;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CustomAvatar
              src={`data:image/png;base64,${from.account.institution.logo}`}
              name={from.account.institution.name}
            />

            <div>
              <Typography variant="subtitle2" noWrap>
                {from.description}
              </Typography>

              <Link noWrap variant="body2" sx={{ color: 'text.disabled', cursor: 'pointer' }}>
                {from.account.name} [{from.account.mask}]
              </Link>
            </div>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CustomAvatar
              src={`data:image/png;base64,${to.account.institution.logo}`}
              name={to.account.institution.name}
            />

            <div>
              <Typography variant="subtitle2" noWrap>
                {to.description}
              </Typography>

              <Link noWrap variant="body2" sx={{ color: 'text.disabled', cursor: 'pointer' }}>
                {to.account.name} [{to.account.mask}]
              </Link>
            </div>
          </Stack>
        </TableCell>

        <TableCell align="left">{fDate(date)}</TableCell>

        <TableCell align="right">
          <Typography fontFamily="Lucida Sans Typewriter" color="#36B37E" fontWeight="bold">
            {fCurrency(to.amount)}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
}
