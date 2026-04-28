import { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import type { ExpenseType } from "@/backend/domain/budgetManager/ExpenseEntry";

export type CopyCategory = "INCOME" | "FIXED_EXPENSE" | "VARIABLE_EXPENSE";

export interface BulkCopyItemsInput {
  sourceBudgetMonthId: string;
  targetBudgetMonthId: string;
  category: CopyCategory;
  itemIds: string[];
}

export interface BulkCopyItemsResult {
  copiedItems: Array<{ id: string; name: string; amount: number }>;
  count: number;
}

/** Maps a CopyCategory to the corresponding ExpenseType. */
const categoryToExpenseType: Record<Exclude<CopyCategory, "INCOME">, ExpenseType> = {
  FIXED_EXPENSE: "FIXED",
  VARIABLE_EXPENSE: "VARIABLE",
};

/**
 * Copies selected items from a source budget month to a target budget month.
 *
 * Reads items from the source month, filters by the provided IDs, and creates
 * new entries in the target month preserving name, amount, and type (for expenses).
 * IDs that don't exist in the source month are silently ignored.
 *
 * @param {IIncomeEntryRepository} incomeRepo - Income entry repository.
 * @param {IExpenseEntryRepository} expenseRepo - Expense entry repository.
 * @param {BulkCopyItemsInput} input - Copy operation parameters.
 * @returns {Promise<BulkCopyItemsResult>} Created items and count.
 */
export const bulkCopyItems = async (
  incomeRepo: IIncomeEntryRepository,
  expenseRepo: IExpenseEntryRepository,
  input: BulkCopyItemsInput,
): Promise<BulkCopyItemsResult> => {
  const { sourceBudgetMonthId, targetBudgetMonthId, category, itemIds } = input;
  const idSet = new Set(itemIds);

  if (category === "INCOME") {
    const sourceItems = await incomeRepo.findByBudgetMonth(sourceBudgetMonthId);
    const selected = sourceItems.filter(item => idSet.has(item.id));

    const copiedItems: BulkCopyItemsResult["copiedItems"] = [];
    for (const item of selected) {
      const created = await incomeRepo.create({
        budgetMonthId: targetBudgetMonthId,
        name: item.name,
        amount: item.amount,
      });
      copiedItems.push({ id: created.id, name: created.name, amount: created.amount });
    }

    return { copiedItems, count: copiedItems.length };
  }

  // FIXED_EXPENSE or VARIABLE_EXPENSE
  const expenseType = categoryToExpenseType[category];
  const sourceItems = await expenseRepo.findByBudgetMonth(sourceBudgetMonthId, expenseType);
  const selected = sourceItems.filter(item => idSet.has(item.id));

  const copiedItems: BulkCopyItemsResult["copiedItems"] = [];
  for (const item of selected) {
    const created = await expenseRepo.create({
      budgetMonthId: targetBudgetMonthId,
      name: item.name,
      amount: item.amount,
      type: expenseType,
    });
    copiedItems.push({ id: created.id, name: created.name, amount: created.amount });
  }

  return { copiedItems, count: copiedItems.length };
};
