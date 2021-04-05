import { CalculateBalance } from "../AccountUtils";

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
