import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../components/settings';
import { gql } from 'src/__generated__/gql';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useParams } from 'react-router';

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
  const { data, loading, refetch } = useQuery(getTransactionQuery);

  useEffect(() => {
    refetch({
      transactionId: id,
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
      </Container>
    </>
  );
}
