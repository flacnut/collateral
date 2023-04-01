import { Account, BackfilledTransaction, CoreTransaction } from '@entities';
import { createConnection, getConnectionOptions } from 'typeorm';
import { createInterface } from 'readline';
import { v4 as uuidv4 } from 'uuid';
import data from './../data.json';

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

  const accountId = 'ACCOUNT ID';

  const account = await Account.findOneOrFail({
    id: accountId,
  });

  const existingTransactions = await getExistingTransactionsForAccount(
    accountId,
  );

  let transactions = data.map((row) => {
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
      }
    }

    await transactions[i].save();
    inserted++;
  }

  return [inserted, skipped];
}

function getPossibleDuplicates(
  existingTransactions: ExistingTransactions,
  newTransaction: BackfilledTransaction,
): { exact: CoreTransaction | null; similar: CoreTransaction[] } {
  let dayOfYear = getDayOfYear(new Date(newTransaction.date));
  let possibleDupes = [] as CoreTransaction[];

  let exactMatch =
    existingTransactions.byAmount[newTransaction.amountCents]
      ?.filter(
        (et) =>
          getDayOfYear(new Date(et.date)) === dayOfYear &&
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
    if (Math.abs(newTransaction.amountCents) === Math.abs(et.amountCents)) {
      possibleDupes.push(et);
    }
  });

  return {
    exact: exactMatch,
    similar: possibleDupes,
  };
}

function getCreditCents(credit: string, debit: string) {
  let creditCents = Number(credit.replace('.', '')) ?? 0;
  let debitCents = Number(debit.replace('.', '')) ?? 0;

  return !!creditCents ? Math.abs(creditCents) : Math.abs(debitCents) * -1;
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
  t.date = new Date(data.Date).toISOString().split('T')[0];
  t.backfillDate = new Date().toLocaleDateString();

  return t;
}

backfill().then(([inserted, skipped]) => {
  console.dir(`\n\nDone! ${inserted} rows backfilled, ${skipped} skipped.`);
});
