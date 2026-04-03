"use client";

import { useState } from "react";
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
import { COLORS, FONTS, SPACING } from "@/lib/theme";

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

    if (status === "loading") return null;

    return (
        <div style={{
            minHeight:  "100vh",
            background: COLORS.bg,
            fontFamily: FONTS.body,
            padding:    SPACING["6"],
            boxSizing:  "border-box",
        }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: SPACING["4"], marginBottom: SPACING["6"] }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SPACING["4"], marginBottom: SPACING["6"] }}>
                <EditableList
                    title="Fuentes de Ingresos"
                    items={incomeHook.incomes}
                    color={COLORS.income}
                    icon={TrendingUp}
                    onAdd={incomeHook.add}
                    onUpdate={incomeHook.update}
                    onDelete={incomeHook.remove}
                />
                <EditableList
                    title="Gastos Fijos del Mes"
                    items={fixedHook.expenses}
                    color={COLORS.fixed}
                    icon={TrendingDown}
                    onAdd={fixedHook.add}
                    onUpdate={fixedHook.update}
                    onDelete={fixedHook.remove}
                />
                <EditableList
                    title="Gastos Variables del Mes"
                    items={variableHook.expenses}
                    color={COLORS.variable}
                    icon={TrendingDown}
                    onAdd={variableHook.add}
                    onUpdate={variableHook.update}
                    onDelete={variableHook.remove}
                />
            </div>

            {/* Goals + Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING["4"], marginBottom: SPACING["6"] }}>
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
                />
                <FinancialSummaryChart data={barData} totalIncome={totalIncome} />
                <DistributionChart data={pieData} totalIncome={totalIncome} />
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
