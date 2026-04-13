import { IBudgetMonthRepository } from "@/backend/ports/budgetManager/IBudgetMonthRepository";
import { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import type { MonthlySummary } from "@/lib/types/budgetHistory";

/**
 * Retrieves the budget history for a user in a given year.
 *
 * Queries all BudgetMonth records for the user/year, then aggregates
 * income and expense totals per month into MonthlySummary objects.
 *
 * @param {IBudgetMonthRepository} budgetRepo - Budget month repository.
 * @param {IIncomeEntryRepository} incomeRepo - Income entry repository.
 * @param {IExpenseEntryRepository} expenseRepo - Expense entry repository.
 * @param {string} userId - Authenticated user ID.
 * @param {number} year - Calendar year to query.
 * @returns {Promise<MonthlySummary[]>} Aggregated monthly summaries for the year.
 */
export const getBudgetHistory = async (
  budgetRepo: IBudgetMonthRepository,
  incomeRepo: IIncomeEntryRepository,
  expenseRepo: IExpenseEntryRepository,
  userId: string,
  year: number,
): Promise<MonthlySummary[]> => {
  const budgetMonths = await budgetRepo.findByUser(userId);
  const filtered = budgetMonths.filter((bm) => bm.year === year);

  const summaries: MonthlySummary[] = await Promise.all(
    filtered.map(async (bm) => {
      const [incomes, expenses] = await Promise.all([
        incomeRepo.findByBudgetMonth(bm.id),
        expenseRepo.findByBudgetMonth(bm.id),
      ]);

      const totalIncome = incomes.reduce((sum, e) => sum + e.amount, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

      return { year: bm.year, month: bm.month, totalIncome, totalExpenses };
    }),
  );

  return summaries.sort((a, b) => a.month - b.month);
};
