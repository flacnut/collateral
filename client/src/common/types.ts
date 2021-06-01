export type AccountShallow = {
  id: number;
};

export type Account = AccountShallow & {
  accountName: string;
  accountNumber: string;
  institution: string;
  latestBalance: Balance | null;
  latestTransaction: Transaction | null;
};

export type Balance = {
  id: number;
  balanceCents: number;
  date: string;
};

export type Tag = {
  id: number;
  tag: string;
  fixed?: boolean;
};

export type Source = {
  id: number;
  fileName: string;
  account: Account;
  transactions: Transaction[];
};

export type Transaction = {
  id: number;
  originalDescription: string;
  friendlyDescription: string;
  amountCents: number;
  date: Date;
  tags: Tag[];
};
