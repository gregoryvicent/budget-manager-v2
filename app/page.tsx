"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import MetricsGrid from "@/components/MetricsGrid";
import IncomeSection from "@/components/IncomeSection";
import SavingsSection from "@/components/SavingsSection";
import EditableExpensesList from "@/components/EditableExpensesList";
import type { IncomeItem } from "@/components/IncomeSection";
import type { ExpenseItem } from "@/components/ExpensesSection";
import type { SavingsMetric } from "@/components/SavingsSection";

/**
 * Home page component displaying the Budget Manager dashboard.
 * Assembles all section components with editable data.
 * Manages state for income, expenses, and savings with automatic calculations.
 *
 * @returns {JSX.Element} The rendered dashboard page
 */
export default function Home() {
    // State for income sources
    const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([
        { id: "1", name: "Salario (ENCU)", amount: 850.0 },
        { id: "2", name: "Aguinaldo", amount: 100.0 },
        { id: "3", name: "Bono", amount: 50.0 },
        { id: "4", name: "Ingreso 1", amount: 200.0 },
        { id: "5", name: "Otros", amount: 216.0 },
    ]);

    // State for fixed expenses
    const [fixedExpenses, setFixedExpenses] = useState<ExpenseItem[]>([
        { id: "1", name: "Renta (Apartamento)", amount: 315.22, type: "fixed" },
        { id: "2", name: "Electricidad", amount: 25.0, type: "fixed" },
        { id: "3", name: "Internet", amount: 35.0, type: "fixed" },
        { id: "4", name: "Comida para la casa", amount: 110.0, type: "fixed" },
        { id: "5", name: "Donación", amount: 12.0, type: "fixed" },
        { id: "6", name: "Proyecciones para calefón", amount: 12.0, type: "fixed" },
    ]);

    // State for variable expenses
    const [variableExpenses, setVariableExpenses] = useState<ExpenseItem[]>([
        {
            id: "1",
            name: "Herramientas para equipo de voleibol",
            amount: 67.0,
            type: "variable",
        },
        { id: "2", name: "Pago al instructor de VB", amount: 8.0, type: "variable" },
    ]);

    // Calculate totals dynamically
    const totalIncome = useMemo(
        () => incomeItems.reduce((sum, item) => sum + item.amount, 0),
        [incomeItems]
    );

    const fixedTotal = useMemo(
        () => fixedExpenses.reduce((sum, item) => sum + item.amount, 0),
        [fixedExpenses]
    );

    const variableTotal = useMemo(
        () => variableExpenses.reduce((sum, item) => sum + item.amount, 0),
        [variableExpenses]
    );

    const totalExpenses = fixedTotal + variableTotal;

    // State for savings metrics (percentages and amounts)
    const [emergencyFundPercentage, setEmergencyFundPercentage] = useState(11.8);
    const [emergencyFundAmount, setEmergencyFundAmount] = useState(
        (11.8 * 1416.0) / 100
    );
    const [investmentCapitalPercentage, setInvestmentCapitalPercentage] = useState(0.0);
    const [investmentCapitalAmount, setInvestmentCapitalAmount] = useState(0.0);

    // Handlers for emergency fund
    const handleEmergencyFundAmountChange = (amount: number) => {
        setEmergencyFundAmount(amount);
        // Calculate and update percentage: Percentage = (Amount / Total Income) * 100
        if (totalIncome > 0) {
            setEmergencyFundPercentage((amount / totalIncome) * 100);
        }
    };

    const handleEmergencyFundPercentageChange = (percentage: number) => {
        setEmergencyFundPercentage(percentage);
        // Calculate and update amount: Amount = (Percentage * Total Income) / 100
        setEmergencyFundAmount((percentage * totalIncome) / 100);
    };

    // Handlers for investment capital
    const handleInvestmentCapitalAmountChange = (amount: number) => {
        setInvestmentCapitalAmount(amount);
        // Calculate and update percentage: Percentage = (Amount / Total Income) * 100
        if (totalIncome > 0) {
            setInvestmentCapitalPercentage((amount / totalIncome) * 100);
        }
    };

    const handleInvestmentCapitalPercentageChange = (percentage: number) => {
        setInvestmentCapitalPercentage(percentage);
        // Calculate and update amount: Amount = (Percentage * Total Income) / 100
        setInvestmentCapitalAmount((percentage * totalIncome) / 100);
    };

    const emergencyFund: SavingsMetric = {
        id: "1",
        title: "Fondo de Emergencia",
        current: emergencyFundAmount,
        goal: 167.09,
        savingsPercentage: emergencyFundPercentage,
        goalPercentage: 0.0,
    };

    const investmentCapital: SavingsMetric = {
        id: "2",
        title: "Capital de Inversión",
        current: investmentCapitalAmount,
        goal: 0.0,
        savingsPercentage: investmentCapitalPercentage,
        goalPercentage: 0.0,
    };

    const totalSavings = 0.0;

    // Calculate total after expenses
    // Total after expenses = Total Income - Total Expenses - Savings Amount - Investment Amount
    const totalAfterExpenses = totalIncome - totalExpenses - emergencyFundAmount - investmentCapitalAmount;

    // Calculate free money percentage
    // Free money percentage = (Total after expenses / Total Income) * 100
    const freeMoneyPercentage = totalIncome > 0 ? (totalAfterExpenses / totalIncome) * 100 : 0;

    // Calculate fixed expenses percentage
    // Fixed expenses percentage = (Fixed expenses / Total Income) * 100
    const fixedExpensesPercentage = totalIncome > 0 ? (fixedTotal / totalIncome) * 100 : 0;

    // Calculate total expenses percentage
    // Total expenses percentage = (Total expenses / Total Income) * 100
    const totalExpensesPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    return (
        <DashboardLayout>
            {/* Top row: Income, Fixed Expenses, Variable Expenses - 3 separate columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="h-[400px]">
                    {/* Column 1: Income */}
                    <IncomeSection
                        items={incomeItems}
                        total={totalIncome}
                        onItemsChange={setIncomeItems}
                    />
                </div>

                <div className="h-[400px]">
                    {/* Column 2: Fixed Expenses */}
                    <EditableExpensesList
                        title="Gastos Mensuales Fijos"
                        items={fixedExpenses}
                        total={fixedTotal}
                        type="fixed"
                        onItemsChange={setFixedExpenses}
                    />
                </div>

                <div className="h-[400px]">
                    {/* Column 3: Variable Expenses */}
                    <EditableExpensesList
                        title="Gastos Variables del Mes"
                        items={variableExpenses}
                        total={variableTotal}
                        type="variable"
                        onItemsChange={setVariableExpenses}
                    />
                </div>
            </div>

            {/* Bottom section: Metrics and Savings */}
            <div className="space-y-4">
                {/* Metrics grid */}
                <MetricsGrid
                    totalAfterExpenses={totalAfterExpenses}
                    totalExpenses={totalExpenses}
                    incomeUsedPercentage={0}
                    fixedExpensesPercentage={fixedExpensesPercentage}
                    totalExpensesPercentage={totalExpensesPercentage}
                    freeMoneyPercentage={freeMoneyPercentage}
                />

                {/* Savings section */}
                <SavingsSection
                    emergencyFund={emergencyFund}
                    investmentCapital={investmentCapital}
                    totalSavings={totalSavings}
                    totalIncome={totalIncome}
                    onEmergencyFundAmountChange={handleEmergencyFundAmountChange}
                    onEmergencyFundPercentageChange={handleEmergencyFundPercentageChange}
                    onInvestmentCapitalAmountChange={handleInvestmentCapitalAmountChange}
                    onInvestmentCapitalPercentageChange={handleInvestmentCapitalPercentageChange}
                />
            </div>
        </DashboardLayout>
    );
}

