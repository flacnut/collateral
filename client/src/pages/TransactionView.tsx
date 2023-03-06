import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Card, Container, Grid, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../components/settings';
import { gql } from 'src/__generated__/gql';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useParams } from 'react-router';
import Label from 'src/components/label';
import { CustomAvatar } from 'src/components/custom-avatar';
import { fCurrency } from 'src/utils/formatNumber';

// ----------------------------------------------------------------------

type IBasicTransaction = {
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

type IInvestmentTransaction = {
  __typename: 'InvestmentTransaction';
  securityId: string;
  feesCents: number;
  unitPriceCents: number;
  quantity: number;
  type: string;
  subType: string;
} & IBasicTransaction;

type ITransaction = {
  __typename: 'Transaction';
  category: string;
  categoryId: string;
  dateTime: string;
  authorizedDate: string;
  authorizedDateTime: string;
  locationJson: string;
  paymentMetaJson: string;
  originalDescription: string;
  merchant: string;
  paymentChannel: string;
  transactionCode: string;
  pending: boolean;
} & IBasicTransaction;

type IBasicAccount = {
  id: string;
  name: string;
};

const getTransactionQuery = gql(`
query getTransactionQuery($transactionId: String!) {
  getTransaction(id: $transactionId) {
    __typename
  	...on Transaction {
      ...CoreTransactionParts
      ...ExtraTransactionParts
      account {
        id
        name
      }
    }
    ... on InvestmentTransaction {
      ...CoreInvestmentTransactionParts
      ...ExtraInvestmentTransactionParts
      account {
        id
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

fragment CoreInvestmentTransactionParts on InvestmentTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}

fragment ExtraTransactionParts on Transaction {
  category
  categoryId
  dateTime
  authorizedDate
  authorizedDateTime
  locationJson
  paymentMetaJson
  originalDescription
  merchant
  paymentChannel
  transactionCode
  pending
}

fragment ExtraInvestmentTransactionParts on InvestmentTransaction {
  securityId
  feesCents
  unitPriceCents
  quantity
  type
  subType
  
  security {
    id
    name
    isin
    ticker
  }
}`);

export default function PageSix() {
  const { themeStretch } = useSettingsContext();
  const { id } = useParams<string>();
  const [refetch, { data, loading }] = useLazyQuery(getTransactionQuery);

  useEffect(() => {
    !!id &&
      refetch({
        variables: {
          transactionId: id,
        },
      });
  }, [id]);

  useEffect(() => {
    const maybeTransaction = data?.getTransaction;
    switch (maybeTransaction?.__typename) {
      case 'Transaction':
        setTransaction(maybeTransaction as ITransaction);
        break;
      case 'InvestmentTransaction':
        setTransaction(maybeTransaction as IInvestmentTransaction);
        break;
    }
  }, [data]);

  const [transaction, setTransaction] = useState<ITransaction | IInvestmentTransaction | null>(
    null
  );

  return (
    <>
      <Helmet>
        <title>{`Transaction | ${transaction?.id}`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Transaction"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Transactions',
              href: PATH_DASHBOARD.transactions.root,
            },
            {
              name: 'ID: ' + transaction?.id,
            },
          ]}
        />

        <TransactionDetailsView transaction={transaction} loading={loading} />
      </Container>
    </>
  );
}

function TransactionDetailsView(props: {
  transaction: IInvestmentTransaction | ITransaction | null;
  loading: boolean;
}) {
  if (props.loading || !props.transaction) {
    return null;
  }

  const { __typename, amount, account } = props.transaction;
  return (
    <>
      <Card sx={{ pt: 5, px: 5 }}>
        <Grid container>
          <Grid item xs={10} sm={10} sx={{ mb: 5 }}>
            <CustomAvatar name={props.transaction.description} sx={{ display: 'inline-flex' }} />
            <Typography variant="h5" sx={{ display: 'inline-flex', marginLeft: 3 }}>
              {props.transaction.description}
            </Typography>
          </Grid>

          <Grid item xs={2} sm={2} sx={{ mb: 5, textAlign: 'right' }}>
            <Typography
              variant="h5"
              sx={{ display: 'inline-flex', marginLeft: 3 }}
              color={amount > 0 ? '#36B37E' : '#FF5630'}
            >
              {fCurrency(amount)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.disabled' }}>
              Account
            </Typography>

            <Typography variant="body2">{account.name}</Typography>

            <Typography variant="body2">{account.name}</Typography>

            <Typography variant="body2">Phone: {account.name}</Typography>
          </Grid>

          {__typename === 'Transaction' ? (
            <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
              <Typography paragraph variant="overline" sx={{ color: 'text.disabled' }}>
                Merchant
              </Typography>

              <Typography variant="body1">{`Merchant: ${props.transaction.merchant}`}</Typography>

              <Typography variant="body1">
                {`Channel: ${props.transaction.paymentChannel}`}
              </Typography>

              <Typography variant="body1">
                {`Code: ${props.transaction.transactionCode}`}
              </Typography>
            </Grid>
          ) : (
            <></>
          )}

          <Grid container>
            <Grid item sm={12} sx={{ textAlign: { sm: 'left' }, lineHeight: '40px' }}>
              <pre>{JSON.stringify(props.transaction, null, 2)}</pre>
            </Grid>
          </Grid>

          {/*


<Box sx={{ textAlign: { sm: 'right' } }}>
              <Label
                sx={{ textTransform: 'uppercase', mb: 1 }}
                variant="soft"
                color={
                  (props.transaction.__typename === 'InvestmentTransaction' && 'primary') ||
                  (props.transaction.__typename === 'Transaction' && 'secondary') ||
                  'default'
                }
              >
                {props.transaction.__typename}
              </Label>
            </Box>

          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.disabled' }}>
              Invoice from
            </Typography>

            <Typography variant="body2">{invoiceFrom.name}</Typography>

            <Typography variant="body2">{invoiceFrom.address}</Typography>

            <Typography variant="body2">Phone: {invoiceFrom.phone}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.disabled' }}>
              Invoice to
            </Typography>

            <Typography variant="body2">{invoiceTo.name}</Typography>

            <Typography variant="body2">{invoiceTo.address}</Typography>

            <Typography variant="body2">Phone: {invoiceTo.phone}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.disabled' }}>
              date create
            </Typography>

            <Typography variant="body2">{fDate(createDate)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.disabled' }}>
              Due date
            </Typography>

            <Typography variant="body2">{fDate(dueDate)}</Typography>
          </Grid>
        </Grid>

        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 960 }}>
              <TableHead
                sx={{
                  borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                  '& th': { backgroundColor: 'transparent' },
                }}
              >
                <TableRow>
                  <TableCell width={40}>#</TableCell>

                  <TableCell align="left">Description</TableCell>

                  <TableCell align="left">Qty</TableCell>

                  <TableCell align="right">Unit price</TableCell>

                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>

                    <TableCell align="left">
                      <Box sx={{ maxWidth: 560 }}>
                        <Typography variant="subtitle2">{row.title}</Typography>

                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                          {row.description}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="left">{row.quantity}</TableCell>

                    <TableCell align="right">{fCurrency(row.price)}</TableCell>

                    <TableCell align="right">{fCurrency(row.price * row.quantity)}</TableCell>
                  </TableRow>
                ))}

                <StyledRowResult>
                  <TableCell colSpan={3} />

                  <TableCell align="right" sx={{ typography: 'body1' }}>
                    <Box sx={{ mt: 2 }} />
                    Subtotal
                  </TableCell>

                  <TableCell align="right" width={120} sx={{ typography: 'body1' }}>
                    <Box sx={{ mt: 2 }} />
                    {fCurrency(subTotalPrice)}
                  </TableCell>
                </StyledRowResult>

                <StyledRowResult>
                  <TableCell colSpan={3} />

                  <TableCell align="right" sx={{ typography: 'body1' }}>
                    Discount
                  </TableCell>

                  <TableCell
                    align="right"
                    width={120}
                    sx={{ color: 'error.main', typography: 'body1' }}
                  >
                    {discount && fCurrency(-discount)}
                  </TableCell>
                </StyledRowResult>

                <StyledRowResult>
                  <TableCell colSpan={3} />

                  <TableCell align="right" sx={{ typography: 'body1' }}>
                    Taxes
                  </TableCell>

                  <TableCell align="right" width={120} sx={{ typography: 'body1' }}>
                    {taxes && fCurrency(taxes)}
                  </TableCell>
                </StyledRowResult>

                <StyledRowResult>
                  <TableCell colSpan={3} />

                  <TableCell align="right" sx={{ typography: 'h6' }}>
                    Total
                  </TableCell>

                  <TableCell align="right" width={140} sx={{ typography: 'h6' }}>
                    {fCurrency(totalPrice)}
                  </TableCell>
                </StyledRowResult>
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <Divider sx={{ mt: 5 }} />

        <Grid container>
          <Grid item xs={12} md={9} sx={{ py: 3 }}>
            <Typography variant="subtitle2">NOTES</Typography>

            <Typography variant="body2">
              We appreciate your business. Should you need us to add VAT or extra notes let us know!
            </Typography>
          </Grid>

          <Grid item xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
            <Typography variant="subtitle2">Have a Question?</Typography>

            <Typography variant="body2">support@minimals.cc</Typography>
          </Grid>
                  */}
        </Grid>
      </Card>
    </>
  );
}
