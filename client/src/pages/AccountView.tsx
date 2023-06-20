import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../components/settings';
import { useParams } from 'react-router';
import { useLazyQuery } from '@apollo/client';
import { useEffect } from 'react';
import { gql } from 'src/__generated__/gql';

// ----------------------------------------------------------------------

const getAccountQuery = gql(`
query getAccount($accountId: String!) {
  getAccount(accountId: $accountId) {
    name
    officialName
    status
    type
    latestTransaction {
      id
      amount
      amountCents
      classification
      date
      description
      tags {
        name
      }
    }
    latestBalance {
      availableCents
      balanceCents
      lastUpdateDate
      limitCents
    }
    institution {
      logo
      primaryColor
      name
    }
  }
}`);

export default function AccountView() {
  const { themeStretch } = useSettingsContext();
  const { id } = useParams<string>();
  const [refetch, { data, loading }] = useLazyQuery(getAccountQuery);

  useEffect(() => {
    !!id &&
      refetch({
        variables: {
          accountId: id,
        },
      });
  }, [id]);

  return (
    <>
      <Helmet>
        <title>Account</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Account
        </Typography>

        <Typography gutterBottom>
          <pre>${JSON.stringify(data?.getAccount, null, 2)}</pre>
        </Typography>
      </Container>
    </>
  );
}
