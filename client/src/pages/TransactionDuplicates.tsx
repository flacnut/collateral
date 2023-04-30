import { Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from 'src/components/settings';

export default function TransactionDuplicates() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Transaction: Duplicates</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Transaction Duplicates
        </Typography>
      </Container>
    </>
  );
}
