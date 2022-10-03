import { Institution, AccountBase, Transaction, Holding, Security, InvestmentTransaction, AccountBalance } from "plaid";
import { PlaidAccount, PlaidAccountBalance, PlaidHoldingTransaction, PlaidInstitution, PlaidInvestmentHolding, PlaidItem, PlaidSecurity, PlaidTransaction } from "../../src/entity/plaid";

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
  rawInstitution: Institution,
): Promise<PlaidInstitution> {
  const institution = new PlaidInstitution();
  institution.id = rawInstitution.institutionId;
  institution.name = rawInstitution.name;
  institution.logo = rawInstitution.logo ?? null;
  institution.primaryColor = rawInstitution.primary_color ?? null;
  institution.products = rawInstitution.products.join(',');
  institution.countryCodes = rawInstitution.country_codes.join(',');
  return await institution.save();
}

export async function createAccount(
  item: PlaidItem,
  rawAccount: AccountBase,
): Promise<PlaidAccount> {
  const account = new PlaidAccount();
  account.id = rawAccount.account_id;
  account.itemId = item.id;
  account.institutionId = item.institutionId;
  account.mask = rawAccount.mask;
  account.name = rawAccount.name;
  account.officialName = rawAccount.official_name;
  account.type = rawAccount.type;
  account.subtype = rawAccount.subtype;
  account.currency = rawAccount.balances.iso_currency_code;

  await Promise.all([
    account.save(),
    createBalance(account, rawAccount.balances)
  ]);

  return account;
}

export async function createBalance(
  account: PlaidAccount,
  rawBalance: AccountBalance,
): Promise<PlaidAccountBalance> {
  const balance = new PlaidAccountBalance();
  balance.accountId = account.id;
  balance.availableCents = Math.floor(rawBalance.available ?? 0 * 100);
  balance.balanceCents = Math.floor(rawBalance.current ?? 0 * 100);
  balance.limitCents = Math.floor(rawBalance.limit ?? 0 * 100);
  balance.currency = rawBalance.iso_currency_code;
  return await balance.save();
}

export async function createTransaction(
  rawTransaction: Transaction
): Promise<PlaidTransaction> {
  // verify account Id
  const transaction = new PlaidTransaction();
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
  transaction.originalDescription = rawTransaction.original_description ?? rawTransaction.name;
  transaction.merchant = rawTransaction.merchant_name ?? '';
  transaction.transactionCode = rawTransaction.transaction_code ?? '';
  return transaction.save();
}

export async function createSecurity(
  rawSecurity: Security,
): Promise<PlaidSecurity> {
  // verify Account ID & security
  const security = new PlaidSecurity();
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
  rawHolding: Holding,
): Promise<PlaidInvestmentHolding> {
  // verify Account ID & security
  const holding = new PlaidInvestmentHolding();
  holding.accountId = rawHolding.account_id;
  holding.securityId = rawHolding.security_id;
  holding.costBasisCents = Math.floor(rawHolding.cost_basis ?? 0 * 100);
  holding.quantity = rawHolding.quantity;
  holding.institutionPriceCents = Math.floor(rawHolding.institution_price * 100);
  holding.institutionValueCents = Math.floor(rawHolding.institution_value * 100);
  holding.institutionPriceAsOfDate = rawHolding.institution_price_as_of;
  holding.currency = rawHolding.iso_currency_code;
  return await holding.save();
}

export async function createHoldingTransaction(
  rawIT: InvestmentTransaction,
): Promise<PlaidHoldingTransaction> {
  // verify Account ID & security
  const holdingTransaction = new PlaidHoldingTransaction();
  holdingTransaction.id = rawIT.investment_transaction_id;
  holdingTransaction.accountId = rawIT.account_id;
  holdingTransaction.securityId = rawIT.security_id ?? '';
  holdingTransaction.description = rawIT.name;
  holdingTransaction.amountCents = Math.floor(rawIT.amount * 100);
  holdingTransaction.feesCents = Math.floor(rawIT.fees ?? 0 * 100);
  holdingTransaction.unitPriceCents = Math.floor(rawIT.price * 100);
  holdingTransaction.quantity = rawIT.quantity;
  holdingTransaction.currency = rawIT.iso_currency_code;
  holdingTransaction.date = rawIT.date;
  holdingTransaction.type = rawIT.type;
  holdingTransaction.subType = rawIT.subtype;
  return await holdingTransaction.save();
}