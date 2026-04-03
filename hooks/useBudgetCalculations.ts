import { type ListItem } from "@/lib/types";
import type { SavingsGoalData } from "@/hooks/useSavingsGoals";

interface BudgetCalculations {
    totalIncome: number;
    totalFixed: number;
    totalVariable: number;
    totalExpenses: number;
    totalSavingsAllocation: number;
    totalInvestmentAllocation: number;
    afterExpenses: number;
    freePct: number;
    totalExpPct: number;
}

/**
 * Calculates budget totals and percentages from income, expenses, and goal allocations.
 *
 * @param {ListItem[]} incomes - Income sources.
 * @param {ListItem[]} fixedExpenses - Fixed expenses.
 * @param {ListItem[]} variableExpenses - Variable expenses.
 * @param {SavingsGoalData[]} savingsGoals - Savings goals.
 * @param {SavingsGoalData[]} investmentGoals - Investment goals.
 * @param {Map<string, number>} goalSettings - Map of goalId -> allocationPct.
 * @returns {BudgetCalculations} Derived budget calculations.
 */
export const useBudgetCalculations = (
    incomes: ListItem[],
    fixedExpenses: ListItem[],
    variableExpenses: ListItem[],
    savingsGoals: SavingsGoalData[],
    investmentGoals: SavingsGoalData[],
    goalSettings: Map<string, number>,
): BudgetCalculations => {
    const totalIncome   = incomes.reduce((s, i) => s + i.amount, 0);
    const totalFixed    = fixedExpenses.reduce((s, i) => s + i.amount, 0);
    const totalVariable = variableExpenses.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = totalFixed + totalVariable;

    const sumAllocation = (goals: SavingsGoalData[]) =>
        goals.reduce((sum, g) => {
            const pct = goalSettings.get(g.id) ?? 0;
            return sum + totalIncome * (pct / 100);
        }, 0);

    const totalSavingsAllocation    = sumAllocation(savingsGoals);
    const totalInvestmentAllocation = sumAllocation(investmentGoals);
    const afterExpenses = totalIncome - totalExpenses - totalSavingsAllocation - totalInvestmentAllocation;
    const freePct       = totalIncome > 0 ? (afterExpenses / totalIncome) * 100 : 0;
    const totalExpPct   = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    return {
        totalIncome, totalFixed, totalVariable, totalExpenses,
        totalSavingsAllocation, totalInvestmentAllocation, afterExpenses,
        freePct, totalExpPct,
    };
};
