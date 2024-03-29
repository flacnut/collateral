import {
  Account,
  BackfilledTransaction,
  CoreTransaction,
  InvestmentTransaction,
  Security,
} from '@entities';
import { createConnection, getConnectionOptions } from 'typeorm';
import { createInterface } from 'readline';
//import data from './../../data.json';
import { v4 as uuidv4 } from 'uuid';
import csv from 'csvtojson';

const data: any[] = [];

type ExistingTransactions = {
  raw: CoreTransaction[];
  byDate: { [dayOfYear: number]: CoreTransaction[] };
  byAmount: { [amountCents: number]: CoreTransaction[] };
};

async function prompt(query: string) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans: string) => {
      rl.close();
      resolve(ans);
    }),
  );
}

function printFormattedTransaction(t: CoreTransaction | BackfilledTransaction) {
  console.dir(
    `${t.date}   ${t.amountCents.toString().padStart(12)}   ${t.description
      .substring(0, 40)
      .padEnd(40)}   ${t.id.substring(0, 20)}...`,
  );
}

async function backfill(): Promise<[number, number]> {
  const options = await getConnectionOptions(
    process.env.NODE_ENV || 'development',
  );
  await createConnection({ ...options, name: 'default' });
  let skipped = 0;
  let inserted = 0;

  const accountId = 'm134kOQvLRsrqDVr6Zrytk9rLPZkJnCQxqPvm';

  const account = await Account.findOneOrFail({
    id: accountId,
  });

  const existingTransactions = await getExistingTransactionsForAccount(
    accountId,
  );

  // data
  let transactions: Array<InvestmentTransaction | BackfilledTransaction> =
    data.map((row: any) => {
      return mapRowToTransaction(row, account);
    });

  for (let i = 0; i < transactions.length; i++) {
    let possibleDupes = getPossibleDuplicates(
      existingTransactions,
      transactions[i],
    );

    if (!!possibleDupes.exact || !!possibleDupes.similar.length) {
      console.dir(`-------------------------------------------------------`);
      console.dir(
        'Found possible duplicates, <enter> to skip, <s> to save new transaction.',
      );
      console.dir(`New:`);
      printFormattedTransaction(transactions[i]);
      if (possibleDupes.exact) {
        console.dir('Found an exact match:');
        printFormattedTransaction(possibleDupes.exact);
      }

      if (possibleDupes.similar.length > 0) {
        console.dir('Found similar transactions:');
        possibleDupes.similar.forEach(printFormattedTransaction);
      }

      let save = await prompt('');
      if (save !== 's') {
        console.dir('skipping...');
        skipped++;
        continue;
      } else {
        console.dir('writing...');
      }
    }

    await transactions[i].save();
    inserted++;
  }

  return [inserted, skipped];
}

// ts-node ./src/backfill.ts fidelity <file>.csv
async function fidelityBackfill(): Promise<[number, number]> {
  let skipped = 0;
  let inserted = 0;

  let csvFile = null;
  let rows: any[] = [];
  try {
    csvFile = process.argv.filter((arg) => arg.indexOf('csv') > 0)[0];
    rows = await csv().fromFile(csvFile);
  } catch (err) {
    console.error('Could not read CSV file ' + csvFile);
    throw err;
  }

  const options = await getConnectionOptions(
    process.env.NODE_ENV || 'development',
  );
  await createConnection({ ...options, name: 'default' });

  const securities = await Security.find();
  const accounts = await Account.find({
    institutionId: 'ins_12', // fidelity
  });

  let transactions = rows.map((row) =>
    mapFidelityRowToTransaction(row, accounts, securities),
  );

  // save sequentially
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i]) {
      await transactions[i]?.save();
      inserted++;
    } else {
      skipped++;
    }
  }

  return [inserted, skipped];
}

function getPossibleDuplicates(
  existingTransactions: ExistingTransactions,
  newTransaction: BackfilledTransaction | InvestmentTransaction,
): { exact: CoreTransaction | null; similar: CoreTransaction[] } {
  let dayOfYear = getDayOfYear(new Date(newTransaction.date));
  let possibleDupes = [] as CoreTransaction[];

  let exactMatch =
    existingTransactions.byAmount[newTransaction.amountCents]
      ?.filter(
        (et) =>
          getDayOfYear(new Date(et.date)) === dayOfYear &&
          new Date(newTransaction.date).getFullYear() ===
            new Date(et.date).getFullYear() &&
          et.description === newTransaction.description,
      )
      ?.pop() ?? null;

  let nearbyET = [
    ...(existingTransactions.byDate[dayOfYear - 3] ?? []),
    ...(existingTransactions.byDate[dayOfYear - 2] ?? []),
    ...(existingTransactions.byDate[dayOfYear - 1] ?? []),
    ...(existingTransactions.byDate[dayOfYear] ?? []),
    ...(existingTransactions.byDate[dayOfYear + 1] ?? []),
    ...(existingTransactions.byDate[dayOfYear + 2] ?? []),
    ...(existingTransactions.byDate[dayOfYear + 3] ?? []),
  ];

  nearbyET.forEach((et) => {
    // not same amount
    if (!(Math.abs(newTransaction.amountCents) === Math.abs(et.amountCents))) {
      return;
    }

    // not same year (but not on a year boundary)
    if (
      new Date(newTransaction.date).getFullYear() !==
        new Date(et.date).getFullYear() &&
      5 < dayOfYear &&
      dayOfYear < 360
    ) {
      return;
    }

    possibleDupes.push(et);
  });

  return {
    exact: exactMatch,
    similar: possibleDupes,
  };
}

function getDecimalAsCents(num: string | null): number {
  let cleanNum = num?.replace(',', '') ?? '';
  if (cleanNum.indexOf('.') === -1) {
    return Number(cleanNum + '00');
  }

  switch (cleanNum.length - cleanNum.indexOf('.')) {
    case 6:
    case 5:
    case 4:
      // x.0000
      return Number(
        cleanNum.substring(cleanNum.indexOf('.') + 3).replace('.', ''),
      );
    case 3:
      // x.00
      return Number(cleanNum.replace('.', ''));
    case 2:
      // x.0
      return Number(cleanNum.replace('.', '') + '0');
    case 1:
      // x.
      return Number(cleanNum.replace('.', '') + '00');
    default:
      throw new Error('invalid number format');
  }
}

function getCreditCents(credit: string, debit: string | undefined) {
  if (!!debit) {
    // two values
    let creditCents = getDecimalAsCents(credit ?? '');
    let debitCents = getDecimalAsCents(debit ?? '');

    return !!creditCents ? Math.abs(creditCents) : Math.abs(debitCents) * -1;
  }

  return getDecimalAsCents(credit);
}

function getDayOfYear(date: Date): number {
  var d = new Date(date);
  d.setMonth(0, 0);
  return Math.round((date.getTime() - d.getTime()) / 8.64e7);
}

async function getExistingTransactionsForAccount(
  accountId: string,
): Promise<ExistingTransactions> {
  let rawTransactions = await CoreTransaction.find({ accountId });
  let account = await Account.findOneOrFail({ id: accountId });

  let existingTransactions = {
    raw: rawTransactions,
    byDate: {},
    byAmount: {},
  } as ExistingTransactions;

  rawTransactions.forEach((transaction) => {
    let dayOfYear = getDayOfYear(new Date(transaction.date));

    // this happens on-load, so lets reverse it to "raw" compare
    // the results from the DB with our yet-unsaved new transactions.
    if (account.invertTransactions) {
      transaction.amountCents *= -1;
    }

    if (!existingTransactions.byAmount[transaction.amountCents]) {
      existingTransactions.byAmount[transaction.amountCents] = [];
    }

    if (!existingTransactions.byDate[dayOfYear]) {
      existingTransactions.byDate[dayOfYear] = [];
    }

    existingTransactions.byAmount[transaction.amountCents].push(transaction);
    existingTransactions.byDate[dayOfYear].push(transaction);
  });

  return existingTransactions;
}

function getAccountFromDescription(
  fidelityAccountDesc: string,
  fidelityAccounts: Account[],
): Account | null {
  let maybeAccName = fidelityAccountDesc.split(' ').slice(0, -1).join(' ');
  return (
    fidelityAccounts
      .filter((account) => account.name.indexOf(maybeAccName) > -1)
      .pop() ?? null
  );
}

function getSecurityFromSymbol(
  symbol: string,
  fidelitySecurities: Security[],
): Security | null {
  return (
    fidelitySecurities.filter((security) => security.ticker === symbol).pop() ??
    null
  );
}

function mapFidelityRowToTransaction(
  row: any,
  fidelityAccounts: Account[],
  fidelitySecurities: Security[],
): InvestmentTransaction | BackfilledTransaction | null {
  let account = getAccountFromDescription(row['Account'], fidelityAccounts);
  if (!account) {
    console.error(`Could not find account for: ${row['Account']}`);
    return null;
  }

  if (row['Symbol'] != '') {
    let security = getSecurityFromSymbol(row['Symbol'], fidelitySecurities);
    if (!security) {
      console.error(`Could not find security for: ${row['Symbol']}`);
      return null;
    }

    return mapRowToInvestmentTransaction(
      {
        unitPriceCents: row['Price ($)'],
        quantity: row['Quantity'],
        Amount: row['Amount ($)'],
        Description: row['Action'],
        Date: row['Run Date'],
        securityId: security.id,
      },
      account,
    );
  } else {
    return mapRowToTransaction(
      {
        Amount: row['Amount ($)'],
        Description: row['Action'],
        Date: row['Run Date'],
      },
      account,
    );
  }
}

function mapRowToInvestmentTransaction(
  data: any,
  account: Account,
): InvestmentTransaction {
  const t = new InvestmentTransaction();
  let creditCents = getCreditCents(data.Credit ?? data.Amount, data.Debit);

  if (isNaN(creditCents)) {
    process.abort();
  }

  if (account.invertTransactions) {
    creditCents = creditCents * -1;
  }

  t.id = `backfill-${uuidv4()}`;
  t.accountId = account.id;
  t.amountCents = creditCents;
  t.description = data.Description;
  t.date = new Date(data.Date).toISOString().split('T')[0];

  t.securityId = data.securityId;
  t.quantity = data.quantity;
  t.unitPriceCents = data.unitPriceCents;

  return t;
}

function mapRowToTransaction(
  data: any,
  account: Account,
): BackfilledTransaction {
  const t = new BackfilledTransaction();
  let creditCents = getCreditCents(data.Credit ?? data.Amount, data.Debit);

  if (isNaN(creditCents)) {
    process.abort();
  }

  if (account.invertTransactions) {
    creditCents = creditCents * -1;
  }

  t.id = `backfill-${uuidv4()}`;
  t.accountId = account.id;
  t.amountCents = creditCents;
  t.description = data.Description;
  t.date = new Date(data.Date).toISOString().split('T')[0];
  t.backfillDate = new Date().toISOString().split('T')[0];

  return t;
}

if (process.argv.indexOf('fidelity') > 0) {
  fidelityBackfill().then(
    ([inserted, skipped]) => {
      console.log(`\nDone! ${inserted} rows backfilled, ${skipped} skipped.`);
    },
    (err) => {
      console.error(err);
      console.log(`Failed: ${err.message}`);
    },
  );
} else {
  backfill().then(([inserted, skipped]) => {
    console.dir(`\n\nDone! ${inserted} rows backfilled, ${skipped} skipped.`);
  });
}
