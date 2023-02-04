import {
  CalculateBalance,
  MatchTransfers,
  DetectDuplicateTransactions,
} from "../AccountUtils";

test("Calculates accout balance with offset", () => {
  expect(
    CalculateBalance(
      [
        { date: "12/23/2017", amountCents: -2300 },
        { date: "12/28/2017", amountCents: -4560 },
        { date: "1/4/2018", amountCents: 6000 },
        { date: "1/4/2018", amountCents: -500 },
        { date: "1/4/2018", amountCents: -100 },
        { date: "1/5/2018", amountCents: 600 },
      ],
      { date: "1/3/2018", amountCents: 0 }
    )
  ).toEqual([
    { date: "12/23/2017", amountCents: 4560 },
    { date: "12/24/2017", amountCents: 4560 },
    { date: "12/25/2017", amountCents: 4560 },
    { date: "12/26/2017", amountCents: 4560 },
    { date: "12/27/2017", amountCents: 4560 },
    { date: "12/28/2017", amountCents: 0 },
    { date: "12/29/2017", amountCents: 0 },
    { date: "12/30/2017", amountCents: 0 },
    { date: "12/31/2017", amountCents: 0 },
    { date: "1/1/2018", amountCents: 0 },
    { date: "1/2/2018", amountCents: 0 },
    { date: "1/3/2018", amountCents: 0 },
    { date: "1/4/2018", amountCents: 5400 },
    { date: "1/5/2018", amountCents: 6000 },
  ]);
});

test("Deduplicate transactions", () => {
  expect(
    DetectDuplicateTransactions(
      [
        {
          id: 1,
          date: "12/23/2017",
          amountCents: -1000,
          originalDescription: "AMZN BUY SOCKS",
        },
        {
          id: 2,
          date: "11/14/2017",
          amountCents: -1000,
          originalDescription: "AMZN BUY CHEESE",
        },
        {
          id: 3,
          date: "12/23/2017",
          amountCents: -1432,
          originalDescription: "AMZN BUY SOCKS",
        },
      ],
      [
        {
          id: undefined,
          date: "12/18/2017",
          amountCents: 1000,
          originalDescription: "PAYMENT THANK YOU",
        },

        {
          id: undefined,
          date: "12/23/2017",
          amountCents: -1000,
          originalDescription: "AMZN BUY SOCKS",
        },
      ]
    )
  ).toEqual({
    unique: [
      {
        id: undefined,
        amountCents: 1000,
        date: "12/18/2017",
        originalDescription: "PAYMENT THANK YOU",
      },
    ],
    duplicates: [
      {
        id: undefined,
        amountCents: -1000,
        date: "12/23/2017",
        originalDescription: "AMZN BUY SOCKS",
      },
    ],
  });
});

test("Detect transfers between accounts", () => {
  expect(
    MatchTransfers([
      {
        date: "12/23/2018",
        amountCents: -1000,
        accountId: 2,
        transactionId: 4,
      },
      {
        date: "12/28/2018",
        amountCents: 1000,
        accountId: 3,
        transactionId: 5,
      },
    ])
  ).toEqual([{ from: 4, to: 5, amountCents: 1000 }]);

  expect(
    MatchTransfers([
      {
        date: "01/09/2018",
        amountCents: 1000,
        accountId: 3,
        transactionId: 1,
      },
      {
        date: "01/03/2018",
        amountCents: +5000,
        accountId: 2,
        transactionId: 2,
      },
      {
        date: "12/28/2017",
        amountCents: 1000,
        accountId: 3,
        transactionId: 3,
      },
      {
        date: "12/29/2017",
        amountCents: -5000,
        accountId: 3,
        transactionId: 4,
      },
      {
        date: "12/31/2017",
        amountCents: -5000,
        accountId: 3,
        transactionId: 5,
      },
      {
        date: "12/23/2017",
        amountCents: -2222,
        accountId: 3,
        transactionId: 6,
      },
    ])
  ).toEqual([{ from: 5, to: 2, amountCents: 5000 }]);
});
