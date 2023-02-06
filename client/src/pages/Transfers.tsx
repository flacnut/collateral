import { Helmet } from 'react-helmet-async';
import { SetStateAction, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Chart from 'react-apexcharts';
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
  CardProps,
  alpha,
  Box,
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
import { fCurrency, fPercent } from 'src/utils/formatNumber';
import { useQuery } from '@apollo/client';
import { ApexOptions } from 'apexcharts';
import { merge } from 'lodash';
import { ColorSchema } from 'src/theme/palette';

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

const getTransfersQuery = gql(`
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

// ----------------------------------------------------------------------

export default function Transfers() {
  const { loading, data } = useQuery(getTransfersQuery);
  useEffect(() => {
    const maybedata = data?.getPossibleTransfers as unknown[] | null;
    setTableData((maybedata ?? []) as ITransfer[]);
  }, [data]);

  const { themeStretch } = useSettingsContext();

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
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
              onClick={() => {
                /* SAVE TRANSFERS */
              }}
            >
              Save Transfers
            </Button>
          }
        />

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={dense}
              numSelected={selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked: any) =>
                onSelectAllRows(
                  checked,
                  tableData.map((row: ITransfer) => `${row.to.id}__${row.from.id}`)
                )
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
                      tableData.map((row: ITransfer) => `${row.to.id}__${row.from.id}`)
                    )
                  }
                />

                <TableBody>
                  {tableData
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

                  <TableNoData isNotFound={loading} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={tableData.length}
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
