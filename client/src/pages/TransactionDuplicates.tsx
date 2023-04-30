import { useLazyQuery } from '@apollo/client';
import { Button, Card, Container, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import {
  BasicTransactionTable,
  IBasicTransaction,
} from 'src/components/tables/BasicTransactionTable';
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

const deleteTransactionsMutation = gql(`mutation deleteTransactions($transactionIds: [String!]!) {
  deleteTransactions(transactionIds:$transactionIds) 
}`);

type Duplicate = {
  key: string;
  transactions: IBasicTransaction[];
};

type Tab = { value: string; label: string; count: number };

function getTabsArray(duplicates: Duplicate[]): Array<Tab> {
  let accountCounts = duplicates.reduce(
    (accountCount: { [accountName: string]: number }, duplicateSet) => {
      let transaction = duplicateSet.transactions[0];

      if (!accountCount[transaction.account.name]) {
        accountCount[transaction.account.name] = 0;
      }

      accountCount[transaction.account.name] = accountCount[transaction.account.name] + 1;
      return accountCount;
    },
    {}
  );

  return Object.keys(accountCounts).map((accountName, index) => {
    return {
      value: accountName,
      label: accountName,
      count: accountCounts[accountName],
    };
  });
}

export default function TransactionDuplicates() {
  const { themeStretch } = useSettingsContext();
  const [resultIndex, setResultIndex] = useState<number>(-1);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [filteredDuplicates, setFilteredDuplicates] = useState<Duplicate[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);

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
      const tabData = getTabsArray(duplicateData);
      setResultIndex(0);
      setTabs(tabData);
      setTabStatus(tabData[0]?.value ?? '');
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

  // tabs
  const [tabStatus, setTabStatus] = useState('');
  const handleTabStatus = (_: React.SyntheticEvent<Element, Event>, newValue: string) => {
    setTabStatus(newValue);
  };

  const applyFilter = useCallback(
    (tabStatus: string, duplicates: Duplicate[]) => {
      const filtered = duplicates.filter((d) => d.transactions[0].account.name === tabStatus);
      setFilteredDuplicates(filtered);
      setResultIndex(0);
    },
    [setResultIndex, setFilteredDuplicates]
  );

  useEffect(() => {
    applyFilter(tabStatus, duplicates);
  }, [tabStatus, duplicates]);

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
          <Tabs
            value={tabStatus}
            onChange={handleTabStatus}
            sx={{
              px: 2,
              bgcolor: 'background.neutral',
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={
                  <Label color="info" sx={{ mr: 1 }}>
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Divider />
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
              disabled={resultIndex === filteredDuplicates.length - 1}
            >
              <Iconify icon="eva:chevron-right-outline" />
            </Button>
          </Stack>
        </Card>

        <Card>
          <BasicTransactionTable
            transactions={filteredDuplicates[resultIndex]?.transactions ?? []}
            action={console.dir}
            actionText={'keep'}
          />
        </Card>
      </Container>
    </>
  );
}
