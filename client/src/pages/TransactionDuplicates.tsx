import { useLazyQuery } from '@apollo/client';
import { Button, Card, Container, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { IBasicTransaction } from 'src/components/tables/BasicTransactionTable';
import { gql } from 'src/__generated__';

const getDuplicatesQuery = gql(`
query getDuplicates($accountId: String) {
  getDuplicates(accountId:$accountId) {
    key
    transactions {
      ...CoreParts
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

fragment CoreParts on CoreTransaction {
  id
  accountId
  description
  amountCents
  amount
  date
  currency
  classification
}`);

type Duplicate = {
  key: string;
  transactions: IBasicTransaction[];
};

export default function TransactionDuplicates() {
  const { themeStretch } = useSettingsContext();
  const [resultIndex, setResultIndex] = useState<number>(-1);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);

  // Loading data
  const [fetchDuplicates, fetchDuplicatesResult] = useLazyQuery(getDuplicatesQuery);
  useEffect(() => {
    fetchDuplicates({
      variables: {},
    });
  }, []);

  useEffect(() => {
    let duplicateData =
      fetchDuplicatesResult.data?.getDuplicates.map((dr) => {
        return { key: dr.key, transactions: dr.transactions as unknown as IBasicTransaction[] };
      }) ?? [];

    setDuplicates(duplicateData);
    if (duplicateData.length > 0) {
      setResultIndex(0);
    }
  }, [fetchDuplicatesResult.data?.getDuplicates, setDuplicates]);

  // navigation
  const prev = useCallback(() => {
    setResultIndex(Math.max(resultIndex - 1, 0));
  }, [setResultIndex, resultIndex]);

  const next = useCallback(() => {
    setResultIndex(Math.min(resultIndex + 1, duplicates.length - 1));
  }, [setResultIndex, resultIndex, duplicates]);

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

  return (
    <>
      <Helmet>
        <title>Transaction: Duplicates</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction Duplicates
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
            <Button variant="contained" onClick={prev} size="large" disabled={resultIndex === 0}>
              <Iconify icon="eva:chevron-left-outline" />
            </Button>

            <Typography variant="h3" component="h3" sx={{ width: '100%', textAlign: 'center' }}>
              {duplicates[resultIndex]?.key.split('__').join(' - ')}
            </Typography>

            <Button
              variant="contained"
              onClick={next}
              size="large"
              disabled={resultIndex === duplicates.length - 1}
            >
              <Iconify icon="eva:chevron-right-outline" />
            </Button>
          </Stack>
        </Card>
      </Container>
    </>
  );
}
