import {
  Institution as PlaidInstitution,
  AccountBase as PlaidAccountBase,
  Transaction as PlaidTransaction,
  Holding as PlaidHolding,
  Security as PlaidSecurity,
  InvestmentTransaction as PlaidInvestementTransaction,
  AccountBalance as PlaidAccountBalance,
} from 'plaid';
import {
  PlaidItem,
  Institution,
  Account,
  AccountBalance,
  Transaction,
  Security,
  InvestmentHolding,
  InvestmentTransaction,
} from '@entities';

export async function createItem(
  itemId: string,
  accessToken: string,
  institutionId: string,
): Promise<PlaidItem> {
  const item = new PlaidItem();
  item.id = itemId;
  item.accessToken = accessToken;
  item.institutionId = institutionId;
  return await item.save();
}

export async function createInstitution(
  rawInstitution: PlaidInstitution,
): Promise<Institution> {
  const institution = new Institution();
  institution.id = rawInstitution.institution_id;
  institution.name = rawInstitution.name;
  institution.logo = rawInstitution.logo ?? null;
  institution.primaryColor = rawInstitution.primary_color ?? null;
  institution.products = rawInstitution.products.join(',');
  institution.countryCodes = rawInstitution.country_codes.join(',');
  return await institution.save();
}

export async function createAccount(
  item: PlaidItem,
  rawAccount: PlaidAccountBase,
): Promise<Account> {
  const account = new Account();
  account.id = rawAccount.account_id;
  account.itemId = item.id;
  account.institutionId = item.institutionId;
  account.mask = rawAccount.mask;
  account.name = rawAccount.name;
  account.officialName = rawAccount.official_name;
  account.type = rawAccount.type;
  account.subtype = rawAccount.subtype;
  account.currency = rawAccount.balances.iso_currency_code;
  await account.save();
  await createOrUpdateBalance(account.id, rawAccount.balances);

  return account;
}

export async function createOrUpdateBalance(
  accountId: string,
  rawBalance: PlaidAccountBalance,
): Promise<AccountBalance> {
  const lastUpdateDate = rawBalance.last_updated_datetime
    ? new Date(rawBalance.last_updated_datetime).toLocaleDateString()
    : new Date().toLocaleDateString();
  const existingBalance = await AccountBalance.findOne({
    lastUpdateDate,
    accountId,
  });
  const balance = existingBalance ?? new AccountBalance();

  balance.accountId = accountId;
  balance.availableCents = Math.floor(rawBalance.available ?? 0 * 100);
  balance.balanceCents = Math.floor(rawBalance.current ?? 0 * 100);
  balance.limitCents = Math.floor(rawBalance.limit ?? 0 * 100);
  balance.currency = rawBalance.iso_currency_code;
  balance.lastUpdateDate = lastUpdateDate;

  return balance.save();
}

export async function createTransaction(
  rawTransaction: PlaidTransaction,
): Promise<Transaction> {
  // verify account Id
  const transaction = new Transaction();
  transaction.id = rawTransaction.transaction_id;
  transaction.accountId = rawTransaction.account_id;
  transaction.amountCents = Math.floor(rawTransaction.amount * 100);
  transaction.category = rawTransaction.category?.join(',') ?? '';
  transaction.categoryId = rawTransaction.category_id ?? '';
  transaction.currency = rawTransaction.iso_currency_code;
  transaction.date = rawTransaction.date;
  transaction.dateTime = rawTransaction.datetime ?? '';
  transaction.authorizedDate = rawTransaction.authorized_date ?? '';
  transaction.authorizedDateTime = rawTransaction.authorized_datetime ?? '';
  transaction.locationJson = JSON.stringify(rawTransaction.location);
  transaction.paymentChannel = rawTransaction.payment_channel;
  transaction.paymentMetaJson = JSON.stringify(rawTransaction.payment_meta);
  transaction.description = rawTransaction.name;
  transaction.originalDescription =
    rawTransaction.original_description ?? rawTransaction.name;
  transaction.merchant = rawTransaction.merchant_name ?? '';
  transaction.transactionCode = rawTransaction.transaction_code ?? '';
  return transaction.save();
}

export async function createOrUpdateTransaction(
  rawTransaction: PlaidTransaction,
): Promise<Transaction> {
  const existingTransaction = await Transaction.findOne({
    id: rawTransaction.transaction_id,
  });
  const transaction = existingTransaction ?? new Transaction();

  transaction.id = rawTransaction.transaction_id;
  transaction.accountId = rawTransaction.account_id;
  transaction.amountCents = Math.floor(rawTransaction.amount * 100);
  transaction.category = rawTransaction.category?.join(',') ?? '';
  transaction.categoryId = rawTransaction.category_id ?? '';
  transaction.currency = rawTransaction.iso_currency_code;
  transaction.date = rawTransaction.date;
  transaction.dateTime = rawTransaction.datetime ?? '';
  transaction.authorizedDate = rawTransaction.authorized_date ?? '';
  transaction.authorizedDateTime = rawTransaction.authorized_datetime ?? '';
  transaction.locationJson = JSON.stringify(rawTransaction.location);
  transaction.paymentChannel = rawTransaction.payment_channel;
  transaction.paymentMetaJson = JSON.stringify(rawTransaction.payment_meta);
  transaction.description = rawTransaction.name;
  transaction.originalDescription =
    rawTransaction.original_description ?? rawTransaction.name;
  transaction.merchant = rawTransaction.merchant_name ?? '';
  transaction.transactionCode = rawTransaction.transaction_code ?? '';
  transaction.pending = rawTransaction.pending;
  return transaction.save();
}

export async function createOrUpdateSecurity(
  rawSecurity: PlaidSecurity,
): Promise<Security> {
  // verify Account ID & security
  const existingSecurity = await Security.findOne({
    id: rawSecurity.security_id,
  });
  const security = existingSecurity ?? new Security();

  security.id = rawSecurity.security_id;
  security.ticker = rawSecurity.ticker_symbol ?? '';
  security.name = rawSecurity.name ?? '';
  security.closePriceCents = Math.floor(rawSecurity.close_price ?? 0 * 100);
  security.closePriceDate = rawSecurity.close_price_as_of ?? '';
  security.currency = rawSecurity.iso_currency_code;
  security.isCashEquivalent = rawSecurity.is_cash_equivalent ?? false;
  security.type = rawSecurity.type ?? '';
  security.isin = rawSecurity.isin ?? '';
  security.cusip = rawSecurity.cusip ?? '';
  security.sedol = rawSecurity.sedol ?? '';

  return await security.save();
}

export async function createInvestmentHolding(
  rawHolding: PlaidHolding,
): Promise<InvestmentHolding> {
  // verify Account ID & security
  const holding = new InvestmentHolding();
  holding.accountId = rawHolding.account_id;
  holding.securityId = rawHolding.security_id;
  holding.costBasisCents = Math.floor(rawHolding.cost_basis ?? 0 * 100);
  holding.quantity = rawHolding.quantity;
  holding.institutionPriceCents = Math.floor(
    rawHolding.institution_price * 100,
  );
  holding.institutionValueCents = Math.floor(
    rawHolding.institution_value * 100,
  );
  holding.institutionPriceAsOfDate = rawHolding.institution_price_as_of;
  holding.currency = rawHolding.iso_currency_code;
  return await holding.save();
}

export async function createOrUpdateInvestmentTransaction(
  rawIT: PlaidInvestementTransaction,
): Promise<InvestmentTransaction> {
  // verify Account ID & security
  const existingTransaction = await InvestmentTransaction.findOne({
    id: rawIT.transaction_id,
  });
  const investmentTransaction = existingTransaction ?? new InvestmentTransaction();

  investmentTransaction.id = rawIT.investment_transaction_id;
  investmentTransaction.accountId = rawIT.account_id;
  investmentTransaction.securityId = rawIT.security_id ?? '';
  investmentTransaction.description = rawIT.name;
  investmentTransaction.amountCents = Math.floor(rawIT.amount * 100);
  investmentTransaction.feesCents = Math.floor(rawIT.fees ?? 0 * 100);
  investmentTransaction.unitPriceCents = Math.floor(rawIT.price * 100);
  investmentTransaction.quantity = rawIT.quantity;
  investmentTransaction.currency = rawIT.iso_currency_code;
  investmentTransaction.date = rawIT.date;
  investmentTransaction.type = rawIT.type;
  investmentTransaction.subType = rawIT.subtype;
  
  return await investmentTransaction.save();
}
