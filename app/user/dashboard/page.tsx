"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, TrendingDown, DollarSign, Shield } from "lucide-react";

import AnimatedNumber from "@/components/AnimatedNumber";
import EditableList from "@/components/EditableList";
import MetricCard from "@/components/MetricCard";
import GoalsList from "@/components/GoalsList";
import FinancialSummaryChart from "@/components/FinancialSummaryChart";
import DistributionChart from "@/components/DistributionChart";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { useBudgetCalculations } from "@/hooks/useBudgetCalculations";
import { useBudgetMonth } from "@/hooks/useBudgetMonth";
import { useIncomeEntries } from "@/hooks/useIncomeEntries";
import { useExpenseEntries } from "@/hooks/useExpenseEntries";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useGoalMonthSettings } from "@/hooks/useGoalMonthSettings";
import { COLORS, FONTS } from "@/lib/theme";
import { getCategoryColor } from "@/lib/breakdownPalette";
import type { BreakdownData } from "@/components/DistributionChart/types/BreakdownData";

/**
 * Budget dashboard page. Displays income, expenses, multiple savings/investment
 * goals, and financial charts for the authenticated user.
 * Protected by middleware — only accessible at /user/dashboard.
 */
export default function BudgetDashboard() {
    const { data: session, status } = useSession();

    const [sidebarOpen, setSidebarOpen]     = useState(false);
    const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const { budgetMonthId } = useBudgetMonth(selectedYear, selectedMonth);

    const incomeHook   = useIncomeEntries(budgetMonthId);
    const fixedHook    = useExpenseEntries(budgetMonthId, "FIXED");
    const variableHook = useExpenseEntries(budgetMonthId, "VARIABLE");

    const savingsHook    = useSavingsGoals("SAVINGS", selectedYear, selectedMonth);
    const investmentHook = useSavingsGoals("INVESTMENT", selectedYear, selectedMonth);
    const goalSettings   = useGoalMonthSettings(budgetMonthId);

    const {
        totalIncome, totalFixed, totalVariable, totalExpenses,
        totalSavingsAllocation, totalInvestmentAllocation, afterExpenses,
        freePct, totalExpPct,
    } = useBudgetCalculations(
        incomeHook.incomes,
        fixedHook.expenses,
        variableHook.expenses,
        savingsHook.goals,
        investmentHook.goals,
        goalSettings.settings,
    );

    const pieData = [
        { name: "Gastos fijos",   value: totalFixed,                color: COLORS.fixed      },
        { name: "Gastos del mes", value: totalVariable,             color: COLORS.variable   },
        { name: "Ahorros",        value: totalSavingsAllocation,    color: COLORS.savings    },
        { name: "Inversiones",    value: totalInvestmentAllocation, color: COLORS.investment },
        afterExpenses >= 0
            ? { name: "Me queda libre", value: afterExpenses,           color: COLORS.accent  }
            : { name: "Déficit",        value: Math.abs(afterExpenses), color: COLORS.deficit },
    ].filter(d => d.value > 0);

    const barData = [
        { name: "Gané",           value: totalIncome,               color: COLORS.income     },
        { name: "Gastos fijos",   value: totalFixed,                color: COLORS.fixed      },
        { name: "Gastos del mes", value: totalVariable,             color: COLORS.variable   },
        { name: "Ahorros",        value: totalSavingsAllocation,    color: COLORS.savings    },
        { name: "Inversiones",    value: totalInvestmentAllocation, color: COLORS.investment },
        {
            name:  afterExpenses >= 0 ? "Me queda libre" : "Déficit",
            value: afterExpenses,
            color: afterExpenses >= 0 ? COLORS.accent : COLORS.deficit,
        },
    ];

    const breakdownData: BreakdownData = useMemo(() => {
        const incomeItems = incomeHook.incomes.map((item, i) => ({
            name: item.name,
            value: item.amount,
            color: getCategoryColor("incomes", i),
        }));

        const fixedItems = fixedHook.expenses.map((item, i) => ({
            name: item.name,
            value: item.amount,
            color: getCategoryColor("expenses", i),
        }));

        const variableItems = variableHook.expenses.map((item, i) => ({
            name: item.name,
            value: item.amount,
            color: getCategoryColor("expenses", fixedItems.length + i),
        }));

        const allExpenseItems = [...fixedItems, ...variableItems];

        const savingsItems = savingsHook.goals
            .filter(g => (goalSettings.settings.get(g.id) ?? 0) > 0)
            .map((g, i) => ({
                name: g.title,
                value: totalIncome * (goalSettings.settings.get(g.id)!) / 100,
                color: getCategoryColor("savings", i),
            }));

        const investmentItems = investmentHook.goals
            .filter(g => (goalSettings.settings.get(g.id) ?? 0) > 0)
            .map((g, i) => ({
                name: g.title,
                value: totalIncome * (goalSettings.settings.get(g.id)!) / 100,
                color: getCategoryColor("investments", i),
            }));

        return {
            incomes: {
                title: "Ingresos",
                items: incomeItems,
                referenceTotal: totalIncome,
                emptyMessage: "Sin ingresos",
            },
            expenses: {
                title: "Gastos",
                items: allExpenseItems,
                referenceTotal: totalExpenses,
                emptyMessage: "Sin gastos",
            },
            savings: {
                title: "Ahorros",
                items: savingsItems,
                referenceTotal: totalSavingsAllocation,
                emptyMessage: "Sin metas de ahorro asignadas",
            },
            investments: {
                title: "Inversiones",
                items: investmentItems,
                referenceTotal: totalInvestmentAllocation,
                emptyMessage: "Sin metas de inversión asignadas",
            },
        };
    }, [
        incomeHook.incomes, fixedHook.expenses, variableHook.expenses,
        savingsHook.goals, investmentHook.goals, goalSettings.settings,
        totalIncome, totalExpenses, totalSavingsAllocation, totalInvestmentAllocation,
    ]);

    if (status === "loading") return null;

    return (
        <div
            className="min-h-screen p-4 lg:p-6 overflow-x-hidden box-border"
            style={{
                background: COLORS.bg,
                fontFamily: FONTS.body,
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                input::placeholder { color: ${COLORS.muted}; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
                ::-webkit-scrollbar-thumb { background: ${COLORS.cardBorder}; border-radius: 3px; }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; appearance: none; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            <DashboardHeader
                afterExpenses={afterExpenses}
                onToggleSidebar={() => setSidebarOpen(o => !o)}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                userName={session?.user?.name ?? "Usuario"}
            />

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <MetricCard
                    label="Ingresos Totales"
                    value={<AnimatedNumber value={totalIncome} />}
                    color={COLORS.income}
                    icon={TrendingUp}
                    subtitle="Este mes"
                />
                <MetricCard
                    label="Gastos Totales"
                    value={<AnimatedNumber value={totalExpenses} />}
                    color={COLORS.variable}
                    icon={TrendingDown}
                    subtitle={`${totalExpPct.toFixed(1)}% del ingreso`}
                    trend="down"
                />
                <MetricCard
                    label="Disponible"
                    value={<AnimatedNumber value={afterExpenses} />}
                    color={COLORS.accent}
                    icon={DollarSign}
                    subtitle={`${freePct.toFixed(1)}% libre`}
                    trend={afterExpenses >= 0 ? "up" : "down"}
                />
            </div>

            {/* Editable lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <EditableList
                    title="Fuentes de Ingresos"
                    items={incomeHook.incomes}
                    color={COLORS.income}
                    icon={TrendingUp}
                    onAdd={incomeHook.add}
                    onUpdate={incomeHook.update}
                    onDelete={incomeHook.remove}
                    isCreating={incomeHook.isCreating}
                    isUpdating={incomeHook.isUpdating}
                    isDeletingId={incomeHook.isDeletingId}
                />
                <EditableList
                    title="Gastos Fijos del Mes"
                    items={fixedHook.expenses}
                    color={COLORS.fixed}
                    icon={TrendingDown}
                    onAdd={fixedHook.add}
                    onUpdate={fixedHook.update}
                    onDelete={fixedHook.remove}
                    isCreating={fixedHook.isCreating}
                    isUpdating={fixedHook.isUpdating}
                    isDeletingId={fixedHook.isDeletingId}
                />
                <EditableList
                    title="Gastos Variables del Mes"
                    items={variableHook.expenses}
                    color={COLORS.variable}
                    icon={TrendingDown}
                    onAdd={variableHook.add}
                    onUpdate={variableHook.update}
                    onDelete={variableHook.remove}
                    isCreating={variableHook.isCreating}
                    isUpdating={variableHook.isUpdating}
                    isDeletingId={variableHook.isDeletingId}
                />
            </div>

            {/* Goals + Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <GoalsList
                    title="Metas de Ahorro"
                    goals={savingsHook.goals}
                    color={COLORS.savings}
                    icon={Shield}
                    totalIncome={totalIncome}
                    goalSettings={goalSettings.settings}
                    onAdd={savingsHook.add}
                    onUpdate={savingsHook.update}
                    onRemove={savingsHook.remove}
                    onAllocationChange={async (goalId, pct, amount) => {
                        await goalSettings.upsert(goalId, pct, amount);
                        await savingsHook.reload();
                    }}
                    isCreating={savingsHook.isCreating}
                    isDeletingId={savingsHook.isDeletingId}
                />
                <GoalsList
                    title="Metas de Inversión"
                    goals={investmentHook.goals}
                    color={COLORS.investment}
                    icon={TrendingUp}
                    totalIncome={totalIncome}
                    goalSettings={goalSettings.settings}
                    onAdd={investmentHook.add}
                    onUpdate={investmentHook.update}
                    onRemove={investmentHook.remove}
                    onAllocationChange={async (goalId, pct, amount) => {
                        await goalSettings.upsert(goalId, pct, amount);
                        await investmentHook.reload();
                    }}
                    isCreating={investmentHook.isCreating}
                    isDeletingId={investmentHook.isDeletingId}
                />
                <FinancialSummaryChart data={barData} totalIncome={totalIncome} />
                <DistributionChart data={pieData} totalIncome={totalIncome} breakdownData={breakdownData} />
            </div>

            <Sidebar
                open={sidebarOpen}
                onToggle={() => setSidebarOpen(o => !o)}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onMonthSelect={(year, month) => { setSelectedYear(year); setSelectedMonth(month); }}
            />
        </div>
    );
}
