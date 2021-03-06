import { Transaction } from "../entity";
import { createHash } from "crypto";

export type DateAmountTuple = { date: Date; amountCents: number };
export type DateAmountAccountTuple = DateAmountTuple & {
  transactionId: number;
  accountId: number;
};
export type MatchedPair = {
  from: number;
  to: number;
  amountCents: number;
};

export type BaseTransaction = {
  id: number | undefined;
  amountCents: number;
  date: Date;
  originalDescription: string;
};

export function DetectDuplicateTransactions<T extends BaseTransaction>(
  existingTransactions: T[],
  newTransactions: T[]
): { unique: T[]; duplicates: T[] } {
  const duplicates: T[] = [];
  const reducer = (memo: { [key: string]: T }, x: T) => {
    let hash = createHash("sha256");
    let shaSum = hash
      .update(
        `${
          x.amountCents
        }__${x.date.toLocaleDateString()}__${x.originalDescription
          .toLocaleLowerCase()
          .trim()}`
      )
      .digest("hex");

    if (memo[shaSum] && memo[shaSum].amountCents === x.amountCents) {
      duplicates.push(x);
    } else {
      memo[shaSum] = x;
    }

    return memo;
  };

  const existingHashMappedTransactions = existingTransactions.reduce(
    reducer,
    {}
  );

  if (duplicates.length > 0) {
    console.warn(
      "Found duplicates in existing transactions!",
      duplicates.map((d) => d.id)
    );
  }

  const existingAndNewHashMappedTransactions = newTransactions.reduce(
    reducer,
    existingHashMappedTransactions
  );

  return {
    unique: Object.values(existingAndNewHashMappedTransactions).filter(
      (t) => t.id == null
    ),
    duplicates: duplicates,
  };
}

export function CalculateBalance(
  transactions: DateAmountTuple[] | Transaction[],
  knownClosingBalance: DateAmountTuple
): DateAmountTuple[] {
  if (!transactions || !transactions.length) {
    return [];
  }

  const dateChanges: { [date: string]: number /* amountCents */ } = {};
  let minDate: Date = new Date(8640000000000000);
  let maxDate: Date = new Date(-8640000000000000);

  transactions.forEach((t) => {
    if (t.date > maxDate) {
      maxDate = t.date;
    }

    if (t.date < minDate) {
      minDate = t.date;
    }

    if (!dateChanges[t.date.toLocaleDateString()]) {
      dateChanges[t.date.toLocaleDateString()] = 0;
    }

    dateChanges[t.date.toLocaleDateString()] += t.amountCents;
  });

  const dateArray = getDateArray(minDate, maxDate);

  let yesterdaysBalance = 0;
  let balanceOffset = 0;

  return dateArray
    .map((value: Date) => {
      if (dateChanges[value.toLocaleDateString()]) {
        yesterdaysBalance += dateChanges[value.toLocaleDateString()];
      }

      if (knownClosingBalance.date.getTime() == value.getTime()) {
        balanceOffset = knownClosingBalance.amountCents - yesterdaysBalance;
      }

      return { date: value, amountCents: yesterdaysBalance };
    })
    .map((tuple) => {
      return { ...tuple, amountCents: tuple.amountCents + balanceOffset };
    });
}

function checkMatch(
  t1: DateAmountAccountTuple,
  t2: DateAmountAccountTuple
): boolean {
  return (
    t1.amountCents * -1 === t2.amountCents && t1.accountId !== t2.accountId
  );
}

export function MatchTransfers(
  transactions: DateAmountAccountTuple[],
  distance = 14
): Array<MatchedPair> {
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
  const possiblePairs: Array<MatchedPair> = [];
  const isAlreadyMatched = (id: number) =>
    possiblePairs.find((p) => p.from === id || p.to === id) != null;

  transactions.forEach((transaction, index) => {
    let windex = index;
    while (--windex >= 0) {
      if (
        transaction.date.getTime() - transactions[windex].date.getTime() >
        60 * 60 * 24 * 1000 * distance
      ) {
        break;
      }

      if (
        checkMatch(transaction, transactions[windex]) &&
        !isAlreadyMatched(transactions[windex].transactionId)
      ) {
        possiblePairs.push({
          from:
            transaction.amountCents < 0
              ? transaction.transactionId
              : transactions[windex].transactionId,
          to:
            transactions[windex].amountCents > 0
              ? transactions[windex].transactionId
              : transaction.transactionId,
          amountCents: Math.abs(transaction.amountCents),
        });
        break;
      }
    }
  });

  return possiblePairs;
}

function addDays(date: Date, days: number) {
  date.setDate(date.getDate() + days);
  return date;
}

function getDateArray(startDate: Date, stopDate: Date): Date[] {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  return dateArray;
}
