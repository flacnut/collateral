import { TagRule, Transaction } from "@entities";

type RuleResult = {
  ruleId: number;
  transactionIds: number[];
  tagIds: number[];
  ruleTagId: number;
};

export function ApplyTagRules(
  rules: TagRule[],
  transactions: Transaction[]
): Promise<RuleResult[]> {
  const results: RuleResult[] = [];

  // This could be considerably heuristically improved by first
  // grouping or sorting transactions by amount, or account, or description.

  for (let i = 0; i < transactions.length; i++) {}

  return Promise.resolve([]);
}
