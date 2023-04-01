import { createConnection, getConnectionOptions } from 'typeorm';
import { Account, BackfilledTransaction } from '@entities';
import { v4 as uuidv4 } from 'uuid';
import data from './../data.json';

async function backfill() {
  const options = await getConnectionOptions(
    process.env.NODE_ENV || 'development',
  );
  await createConnection({ ...options, name: 'default' });

  const account = await Account.findOneOrFail({
    id: '<ACCOUNT_ID>',
  });

  let inserts = data.map((row) => {
    let transaction = mapRowToTransaction(row, account);
    console.dir(transaction);
    return transaction.save();
  });

  return await Promise.all(inserts);
}

function getCreditCents(credit: string, debit: string) {
  let creditCents = Number(credit.replace('.', '')) ?? 0;
  let debitCents = Number(debit.replace('.', '')) ?? 0;

  return !!creditCents ? Math.abs(creditCents) : Math.abs(debitCents) * -1;
}

function mapRowToTransaction(
  data: any,
  account: Account,
): BackfilledTransaction {
  const t = new BackfilledTransaction();
  let creditCents = getCreditCents(data.Credit, data.Debit);

  if (account.invertTransactions) {
    creditCents = creditCents * -1;
  }

  t.id = `backfill-${uuidv4()}`;
  t.accountId = account.id;
  t.amountCents = creditCents;
  t.description = data.Description;
  t.date = data.Date;
  t.backfillDate = new Date().toLocaleDateString();

  return t;
}

backfill().then(() => {});
