import {
  CalculateBalance,
  MatchTransfers,
  DetectDuplicateTransactions,
} from "../AccountUtils";

test("Calculates accout balance with offset", () => {
  expect(
    CalculateBalance(
      [
        { date: new Date("2017-12-23"), amountCents: -2300 },
        { date: new Date("2017-12-28"), amountCents: -4560 },
        { date: new Date("2018-01-04"), amountCents: 6000 },
        { date: new Date("2018-01-04"), amountCents: -500 },
        { date: new Date("2018-01-04"), amountCents: -100 },
        { date: new Date("2018-01-05"), amountCents: 600 },
      ],
      { date: new Date("2018-01-03"), amountCents: 0 }
    )
  ).toEqual([
    { date: new Date("2017-12-23"), amountCents: 4560 },
    { date: new Date("2017-12-24"), amountCents: 4560 },
    { date: new Date("2017-12-25"), amountCents: 4560 },
    { date: new Date("2017-12-26"), amountCents: 4560 },
    { date: new Date("2017-12-27"), amountCents: 4560 },
    { date: new Date("2017-12-28"), amountCents: 0 },
    { date: new Date("2017-12-29"), amountCents: 0 },
    { date: new Date("2017-12-30"), amountCents: 0 },
    { date: new Date("2017-12-31"), amountCents: 0 },
    { date: new Date("2018-01-01"), amountCents: 0 },
    { date: new Date("2018-01-02"), amountCents: 0 },
    { date: new Date("2018-01-03"), amountCents: 0 },
    { date: new Date("2018-01-04"), amountCents: 5400 },
    { date: new Date("2018-01-05"), amountCents: 6000 },
  ]);
});

test("Deduplicate transactions", () => {
  expect(
    DetectDuplicateTransactions([
      {
        date: new Date("2017-12-23"),
        amountCents: -1000,
        originalDescription: "AMZN BUY SOCKS",
      },
      {
        date: new Date("2017-12-23"),
        amountCents: -1432,
        originalDescription: "AMZN BUY SOCKS",
      },
      {
        date: new Date("2017-11-14"),
        amountCents: -1000,
        originalDescription: "AMZN BUY CHEESE",
      },
      {
        date: new Date("2017-12-18"),
        amountCents: 1000,
        originalDescription: "PAYMENT THANK YOU",
      },
      {
        date: new Date("2017-12-23"),
        amountCents: -1000,
        originalDescription: "AMZN BUY SOCKS",
      },
    ])
  ).toEqual([
    [
      {
        amountCents: -1000,
        date: new Date("2017-12-23"),
        originalDescription: "AMZN BUY SOCKS",
      },
      {
        amountCents: -1432,
        date: new Date("2017-12-23"),
        originalDescription: "AMZN BUY SOCKS",
      },
      {
        amountCents: -1000,
        date: new Date("2017-11-14"),
        originalDescription: "AMZN BUY CHEESE",
      },
      {
        amountCents: 1000,
        date: new Date("2017-12-18"),
        originalDescription: "PAYMENT THANK YOU",
      },
    ],
    [
      {
        amountCents: -1000,
        date: new Date("2017-12-23"),
        originalDescription: "AMZN BUY SOCKS",
      },
    ],
  ]);
});

test("Detect transfers between accounts", () => {
  expect(
    MatchTransfers([
      {
        date: new Date("2017-12-23"),
        amountCents: -1000,
        accountId: 2,
        transactionId: 4,
      },
      {
        date: new Date("2017-12-28"),
        amountCents: 1000,
        accountId: 3,
        transactionId: 5,
      },
    ])
  ).toEqual([{ from: 4, to: 5, amountCents: 1000 }]);

  expect(
    MatchTransfers([
      {
        date: new Date("2018-01-09"),
        amountCents: 1000,
        accountId: 3,
        transactionId: 1,
      },
      {
        date: new Date("2018-01-13"),
        amountCents: +5000,
        accountId: 2,
        transactionId: 2,
      },
      {
        date: new Date("2017-12-28"),
        amountCents: 1000,
        accountId: 3,
        transactionId: 3,
      },
      {
        date: new Date("2017-12-29"),
        amountCents: -5000,
        accountId: 3,
        transactionId: 4,
      },
      {
        date: new Date("2017-12-31"),
        amountCents: -5000,
        accountId: 3,
        transactionId: 5,
      },
      {
        date: new Date("2017-12-23"),
        amountCents: -2222,
        accountId: 3,
        transactionId: 6,
      },
    ])
  ).toEqual([{ from: 5, to: 2, amountCents: 5000 }]);
});
