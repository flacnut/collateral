import { useLazyQuery } from '@apollo/client';
import { Container, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from 'src/components/settings';
import { gql } from 'src/__generated__';

const getDuplicatesQuery = gql(`
query getDuplicates($accountId: String) {
  getDuplicates(accountId:$accountId) {
    key
    transactions {
      id
      amountCents
    }
  }
}`);

export default function TransactionDuplicates() {
  const { themeStretch } = useSettingsContext();

  const [fetchDuplicates, fetchDuplicatesResult] = useLazyQuery(getDuplicatesQuery);

  useEffect(() => {
    fetchDuplicates({
      variables: {},
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Transaction: Duplicates</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction Duplicates
        </Typography>

        <pre>{JSON.stringify(fetchDuplicatesResult.data?.getDuplicates)}</pre>
      </Container>
    </>
  );
}
