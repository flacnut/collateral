import { Helmet } from 'react-helmet-async';
// @mui
import {
  Autocomplete,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
// components
import { useSettingsContext } from '../components/settings';
import { gql } from 'src/__generated__/gql';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  GetAggregatedTransactionsQuery,
  TransactionClassification,
} from 'src/__generated__/graphql';
import { useCallback, useEffect, useState } from 'react';
import { fCurrency } from 'src/utils/formatNumber';
import {
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
  emptyRows,
  useTable,
} from 'src/components/table';
import Scrollbar from 'src/components/scrollbar';
import { CustomAvatar } from 'src/components/custom-avatar';
import { fDate } from 'src/utils/formatTime';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useDebounce } from 'use-debounce';

// ----------------------------------------------------------------------

const unclassifiedTransactionsQuery = gql(`
query getAggregatedTransactions($options: QueryAggregationOptions!) {
  getAggregatedTransactions(options:$options) {
    description
    totalExpenseCents
    totalDepositCents
    transactionCount
    transactionIds
  }
}`);

const transactionsByIdQuery = gql(`
query getTransactionsbyId($ids:[String!]!) {
  getTransactionsById(ids:$ids) {
  
  __typename
  	...on Transaction {
      ...CoreTransactionParts
      account {
        name
      }
      tags {
        name
      }
    }
    ...on BackfilledTransaction {
      ...CoreBackfilledTransactionParts
      account {
        name
      }
      tags {
        name
      }
    }
    ... on InvestmentTransaction {
      ...CoreInvestmentTransactionParts
      account {
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

const transactionsByPropertyQuery = gql(`
query getTransactionsByProperty($properties: QueryTransactionsByPropertyOptions!){
  getTransactionsByProperty(properties: $properties) {
    __typename
  	...on Transaction {
      ...CoreTransactionParts
      account {
        name
      }
      tags {
        name
      }
    }
    ...on BackfilledTransaction {
      ...CoreBackfilledTransactionParts
      account {
        name
      }
      tags {
        name
      }
    }
    ... on InvestmentTransaction {
      ...CoreInvestmentTransactionParts
      account {
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

const Classifications = [
  'Duplicate',
  'Income',
  'Expense',
  'Recurring',
  'Transfer',
  'Investment',
  'Hidden',
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
  tags: ITag[];
};

type ITag = {
  name: String;
};

type IBasicAccount = {
  id: string;
  name: string;
};

export default function TransactionClassifier() {
  const { themeStretch } = useSettingsContext();
  const [resultIndex, setResultIndex] = useState<number>(-1);
  const [tags, setTags] = useState<string[]>([]);
  const [unclassifiedTransactions, setUnclassifiedTransactions] = useState<
    GetAggregatedTransactionsQuery['getAggregatedTransactions']
  >([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    GetAggregatedTransactionsQuery['getAggregatedTransactions']
  >([]);

  // navigation
  const prev = useCallback(() => {
    setResultIndex(Math.max(resultIndex - 1, 0));
  }, [setResultIndex, resultIndex]);

  const next = useCallback(() => {
    setResultIndex(Math.min(resultIndex + 1, filteredTransactions.length - 1));
  }, [setResultIndex, resultIndex, filteredTransactions]);

  const handleKeyPress = useCallback(
    (event: { key: any }) => {
      switch (event.key) {
        case 'ArrowRight':
          next();
          break;
        case 'ArrowLeft':
          prev();
          break;
      }
    },
    [next, prev]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // filter
  const [filterDescription, setFilterDescription] = useState('');
  const [debounceFilterDescription] = useDebounce(filterDescription, 250);
  const handleFilterDescription = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setResultIndex(0);
      setFilterDescription(event.target.value);
    },
    [setResultIndex, setFilterDescription]
  );

  const applyFilter = useCallback(() => {
    setResultIndex(0);
    setFilteredTransactions(
      unclassifiedTransactions.filter(
        (t) =>
          debounceFilterDescription === '' ||
          (t.description &&
            t.description.toLowerCase().indexOf(filterDescription.toLowerCase()) !== -1)
      )
    );
  }, [debounceFilterDescription, unclassifiedTransactions]);

  // loading view
  const [fetchTags, fetchTagResponse] = useLazyQuery(tagsQuery);
  useEffect(() => {
    setTags(Object.values(fetchTagResponse?.data?.tags ?? {}).map((t) => t.name));
  }, [fetchTagResponse.data]);

  const [refetchUnclassified, unclassifiedResponse] = useLazyQuery(unclassifiedTransactionsQuery);
  useEffect(() => {
    if (!(unclassifiedResponse?.data?.getAggregatedTransactions || unclassifiedResponse?.loading)) {
      refetchUnclassified({
        variables: {
          options: {
            description: true,
            unclassifiedOnly: true,
          },
        },
      });
    }

    if (!fetchTagResponse?.loading) {
      fetchTags({
        fetchPolicy: 'no-cache',
      });
    }
  }, []);

  useEffect(() => {
    const aggregateResponse = unclassifiedResponse?.data?.getAggregatedTransactions ?? [];
    if (aggregateResponse.length > 0) {
      setUnclassifiedTransactions(aggregateResponse);
      setResultIndex(0);
      applyFilter();
    }
  }, [unclassifiedResponse?.data, setResultIndex, applyFilter]);

  // modifying data
  const [modifiedTags, setModifiedTags] = useState<string[]>([]);
  const [modifiedClassification, setModifiedClassification] = useState<string | null>(null);

  const [updateTransactionTags, updateTransactionTagsResult] = useMutation(
    updateTransactionTagsQuery
  );
  const [updateTransactionClassification, updateTransactionClassificationResult] = useMutation(
    updateTransactionClassificationQuery
  );

  const handleModifyClassification = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setModifiedClassification(event.target.value);
    },
    [setModifiedClassification]
  );

  const saveChanges = useCallback(async () => {
    if (!!modifiedTags.length) {
      await updateTransactionTags({
        variables: {
          force: false,
          addTags: modifiedTags,
          removeTags: [],
          transactionIds: filteredTransactions[resultIndex]?.transactionIds,
        },
      });
    }
    if (!!modifiedClassification) {
      await updateTransactionClassification({
        variables: {
          transactionIds: filteredTransactions[resultIndex]?.transactionIds,
          classification: modifiedClassification as TransactionClassification,
        },
      });
    }
    await fetchTags({
      fetchPolicy: 'no-cache',
    });
  }, [
    filteredTransactions,
    updateTransactionTags,
    updateTransactionClassification,
    modifiedClassification,
    modifiedTags,
  ]);

  return (
    <>
      <Helmet>
        <title>Transaction: Classify</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction: Classify
        </Typography>

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
            <Button variant="contained" onClick={prev} size="large">
              Previous
            </Button>

            <Autocomplete
              sx={{ width: '500px' }}
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

            <TextField
              fullWidth
              value={filterDescription}
              onChange={handleFilterDescription}
              placeholder="Search client or transaction number..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:save-outline" />}
              onClick={saveChanges}
              size="large"
            >
              Save
            </Button>

            <Button variant="contained" onClick={next} size="large">
              Next
            </Button>
          </Stack>
        </Card>

        <Card sx={{ pt: 5, px: 5, marginBottom: 2 }}>
          <TransactionView {...getAggregatedSet(filteredTransactions ?? [], resultIndex)} />
        </Card>

        <Card sx={{ marginBottom: 2 }}>
          <SimilarTransactionsTableView
            description={filteredTransactions[resultIndex]?.description}
          />
        </Card>

        <Card>
          <BasicTransactionTableView
            transactionIds={filteredTransactions[resultIndex]?.transactionIds ?? []}
          />
        </Card>
      </Container>
    </>
  );
}

function TransactionView(props: {
  description: string;
  totalExpenseCents: number;
  totalDepositCents: number;
  transactionCount: number;
  transactionIds: string[];
}) {
  return (
    <>
      <Grid container>
        <Grid item xs={8} sm={9} sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ display: 'inline-flex', marginLeft: 3 }}>
            {`(${props.transactionCount}) ${props.description}`}
          </Typography>
        </Grid>

        <Grid item xs={4} sm={3} sx={{ mb: 5, textAlign: 'right' }}>
          {props.totalDepositCents > 0 ? (
            <Typography
              variant="h5"
              sx={{ display: 'inline-flex', marginLeft: 3 }}
              color={'#36B37E'}
            >
              {fCurrency(props.totalDepositCents / 100)}
            </Typography>
          ) : null}
          {props.totalExpenseCents > 0 ? (
            <Typography
              variant="h5"
              sx={{ display: 'inline-flex', marginLeft: 3 }}
              color={'#FF5630'}
            >
              {fCurrency(props.totalExpenseCents / 100)}
            </Typography>
          ) : null}
        </Grid>
      </Grid>
    </>
  );
}

function SimilarTransactionsTableView(props: { description: string | undefined | null }) {
  const [refetchByProperty, getByPropertyResponse] = useLazyQuery(transactionsByPropertyQuery);
  const [transactions, setTransactions] = useState<IBasicTransaction[]>([]);

  useEffect(() => {
    if (!props.description || props.description === '') {
      return;
    }

    refetchByProperty({
      variables: {
        properties: { description: props.description },
      },
    });
  }, [props.description, refetchByProperty]);

  useEffect(() => {
    let maybeTransactions = [...(getByPropertyResponse.data?.getTransactionsByProperty ?? [])];
    setTransactions(
      Object.values(
        (maybeTransactions as unknown as IBasicTransaction[]).reduce(
          (prev: { [key: string]: IBasicTransaction }, transaction) => {
            let key =
              transaction.classification +
              '::' +
              transaction.tags
                .map((tag) => tag.name)
                .sort()
                .join(':');

            if (!prev[key]) {
              prev[key] = { ...transaction };
              prev[key].date = '1';
              return prev;
            }

            prev[key].date = (Number(prev[key].date) + 1).toString();
            prev[key].amount += transaction.amount;
            prev[key].amountCents += transaction.amountCents;
            return prev;
          },
          {}
        )
      )
    );
  }, [getByPropertyResponse.data]);

  return <BasicTransactionTable transactions={transactions} />;
}

function BasicTransactionTableView(props: { transactionIds: string[] }) {
  const [refetchByIds, getByIdsResponse] = useLazyQuery(transactionsByIdQuery);
  const [transactions, setTransactions] = useState<IBasicTransaction[]>([]);

  useEffect(() => {
    refetchByIds({
      variables: {
        ids: props.transactionIds,
      },
    });
  }, [props.transactionIds, refetchByIds]);

  useEffect(() => {
    let maybeTransactions = [...(getByIdsResponse.data?.getTransactionsById ?? [])];
    setTransactions(
      (maybeTransactions as unknown as IBasicTransaction[]).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  }, [getByIdsResponse.data]);

  return <BasicTransactionTable transactions={transactions} />;
}

function BasicTransactionTable(props: { transactions: IBasicTransaction[] }) {
  const { transactions } = props;
  const TABLE_HEAD = [
    { id: 'description', label: 'Description', align: 'left' },
    { id: 'amount', label: 'Amount', align: 'right', width: 180 },
    { id: 'date', label: 'Date', align: 'left', width: 140 },
    { id: 'classification', label: 'Classification', align: 'center', width: 240 },
    { id: 'tags', label: 'Tags', align: 'left' },
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
              {transactions.slice(page * 25, page * 25 + 25).map((transaction) => (
                <TransactionTableRow key={transaction.id} transaction={transaction} safe={safe} />
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
  transaction: IBasicTransaction;
  safe: boolean;
}) {
  const { transaction, safe } = props;
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

      <TableCell align="left">{fDate(transaction.date)}</TableCell>

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
    </TableRow>
  );
}

function getAggregatedSet(
  data: GetAggregatedTransactionsQuery['getAggregatedTransactions'],
  index: number
): {
  description: string;
  totalExpenseCents: number;
  totalDepositCents: number;
  transactionCount: number;
  transactionIds: string[];
} {
  if (!data[index]) {
    return {
      description: '',
      totalExpenseCents: 0,
      totalDepositCents: 0,
      transactionCount: 0,
      transactionIds: [],
    };
  }

  return {
    description: data[index].description ?? '',
    totalDepositCents: data[index].totalDepositCents ?? 0,
    totalExpenseCents: data[index].totalExpenseCents ?? 0,
    transactionCount: data[index].transactionCount ?? 0,
    transactionIds: data[index].transactionIds ?? [],
  };
}
