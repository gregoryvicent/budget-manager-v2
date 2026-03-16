import { type ListItem } from "@/lib/types";

interface BudgetCalculations {
    totalIncome: number;
    totalFixed: number;
    totalVariable: number;
    totalExpenses: number;
    savingsAllocation: number;
    investmentAllocation: number;
    afterExpenses: number;
    freePct: number;
    totalExpPct: number;
}

/**
 * Calcula los totales y porcentajes del presupuesto a partir de los datos de entrada.
 *
 * @param {ListItem[]} incomes - Lista de fuentes de ingreso.
 * @param {ListItem[]} fixedExpenses - Lista de gastos fijos.
 * @param {ListItem[]} variableExpenses - Lista de gastos variables.
 * @param {number} savingsPct - Porcentaje asignado a ahorros.
 * @param {number} investmentPct - Porcentaje asignado a inversiones.
 * @returns {BudgetCalculations} Objeto con todos los cálculos derivados del presupuesto.
 */
export const useBudgetCalculations = (
    incomes: ListItem[],
    fixedExpenses: ListItem[],
    variableExpenses: ListItem[],
    savingsPct: number,
    investmentPct: number,
): BudgetCalculations => {
    const totalIncome          = incomes.reduce((s, i) => s + i.amount, 0);
    const totalFixed           = fixedExpenses.reduce((s, i) => s + i.amount, 0);
    const totalVariable        = variableExpenses.reduce((s, i) => s + i.amount, 0);
    const totalExpenses        = totalFixed + totalVariable;
    const savingsAllocation    = totalIncome * (savingsPct / 100);
    const investmentAllocation = totalIncome * (investmentPct / 100);
    const afterExpenses        = totalIncome - totalExpenses - savingsAllocation - investmentAllocation;
    const freePct              = totalIncome > 0 ? (afterExpenses / totalIncome) * 100 : 0;
    const totalExpPct          = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    return {
        totalIncome, totalFixed, totalVariable, totalExpenses,
        savingsAllocation, investmentAllocation, afterExpenses,
        freePct, totalExpPct,
    };
};
