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
import Iconify from 'src/components/iconify';
import { useDebounce } from 'use-debounce';
import {
  BasicTransactionTable,
  IBasicTransaction,
  ITag,
} from 'src/components/tables/BasicTransactionTable';
import {
  AggregatedTransactionTable,
  IAggregatedTransaction,
} from 'src/components/tables/AggregatedTransactionTable';

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
  const [debounceFilterDescription] = useDebounce(filterDescription, 100);
  const handleFilterDescription = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const applyClassification = useCallback(
    (classification: string, tags: ITag[]) => {
      const stringTags = tags.map((t) => t.name) as string[];
      console.dir(stringTags);
      setModifiedClassification(classification);
      setModifiedTags(stringTags);
    },
    [setModifiedTags, setModifiedClassification]
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
              <Iconify icon="eva:chevron-left-outline" />
            </Button>

            <Autocomplete
              sx={{ width: '500px' }}
              multiple
              freeSolo
              value={modifiedTags}
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
              sx={{ width: '200px' }}
              disabled={
                updateTransactionTagsResult.loading || updateTransactionClassificationResult.loading
              }
            >
              Save
            </Button>

            <Button variant="contained" onClick={next} size="large">
              <Iconify icon="eva:chevron-right-outline" />
            </Button>
          </Stack>
        </Card>

        <Card sx={{ pt: 5, px: 5, marginBottom: 2 }}>
          <TransactionView {...getAggregatedSet(filteredTransactions ?? [], resultIndex)} />
        </Card>

        <Card sx={{ marginBottom: 2 }}>
          <SimilarTransactionsTableView
            description={filteredTransactions[resultIndex]?.description}
            applyClassification={applyClassification}
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

function SimilarTransactionsTableView(props: {
  description: string | undefined | null;
  applyClassification: (classification: string, tags: ITag[]) => void;
}) {
  const [refetchByProperty, { data }] = useLazyQuery(transactionsByPropertyQuery);
  const [transactions, setTransactions] = useState<IAggregatedTransaction[]>([]);

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

  const applyClassification = useCallback(
    (transaction: IAggregatedTransaction) => {
      props.applyClassification(transaction.classification, transaction.tags);
    },
    [props.applyClassification]
  );

  useEffect(() => {
    if (!props.description || props.description === '') {
      setTransactions([]);
      return;
    }

    let maybeTransactions = [...(data?.getTransactionsByProperty ?? [])];
    setTransactions(
      Object.values(
        (maybeTransactions as unknown as IBasicTransaction[]).reduce(
          (prev: { [key: string]: IAggregatedTransaction }, transaction) => {
            let key =
              transaction.classification +
              '::' +
              transaction.tags
                .map((tag) => tag.name)
                .sort()
                .join(':');

            if (!prev[key]) {
              prev[key] = {
                transactionIds: [transaction.id],
                count: 1,
                key: key,
                accountId: transaction.accountId,
                description: transaction.description,
                amountCents: transaction.amountCents,
                amount: transaction.amount,
                currency: transaction.currency,
                classification: transaction.classification,
                account: transaction.account,
                tags: transaction.tags,
              } as IAggregatedTransaction;
              return prev;
            }

            prev[key].count++;
            prev[key].amount += transaction.amount;
            prev[key].amountCents += transaction.amountCents;
            return prev;
          },
          {}
        )
      )
    );
  }, [data?.getTransactionsByProperty, setTransactions, props.description]);

  return <AggregatedTransactionTable transactions={transactions} action={applyClassification} />;
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
