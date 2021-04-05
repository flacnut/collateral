import { Transaction } from "../entity";

type DateAmountTuple = { date: Date; amountCents: number };

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
