"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Target, Shield, BarChart2 } from "lucide-react";

import AnimatedNumber from "@/components/AnimatedNumber";
import EditableList from "@/components/EditableList";
import MetricCard from "@/components/MetricCard";
import SavingsCard from "@/components/SavingsCard";
import FinancialSummaryChart from "@/components/FinancialSummaryChart";
import DistributionChart from "@/components/DistributionChart";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import UserSetup from "@/components/UserSetup";
import { useBudgetCalculations } from "@/hooks/useBudgetCalculations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBudgetMonth } from "@/hooks/useBudgetMonth";
import { useIncomeEntries } from "@/hooks/useIncomeEntries";
import { useExpenseEntries } from "@/hooks/useExpenseEntries";
import { useSavingsGoal } from "@/hooks/useSavingsGoal";
import { useGoalMonthSetting } from "@/hooks/useGoalMonthSetting";
import { COLORS, FONTS, SPACING } from "@/lib/theme";

export default function BudgetDashboard() {
    const [sidebarOpen, setSidebarOpen]   = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const { userId, loading: userLoading, createUser } = useCurrentUser();

    const { budgetMonthId } = useBudgetMonth(
        userId ?? "",
        selectedYear,
        selectedMonth,
    );

    const incomeHook   = useIncomeEntries(budgetMonthId);
    const fixedHook    = useExpenseEntries(budgetMonthId, "FIXED");
    const variableHook = useExpenseEntries(budgetMonthId, "VARIABLE");

    const savingsGoalHook    = useSavingsGoal(userId ?? "", "SAVINGS");
    const investmentGoalHook = useSavingsGoal(userId ?? "", "INVESTMENT");

    const savingsSetting = useGoalMonthSetting(
        savingsGoalHook.goal?.id ?? null,
        budgetMonthId,
    );
    const investmentSetting = useGoalMonthSetting(
        investmentGoalHook.goal?.id ?? null,
        budgetMonthId,
    );

    const {
        totalIncome, totalFixed, totalVariable, totalExpenses,
        savingsAllocation, investmentAllocation, afterExpenses,
        freePct, totalExpPct,
    } = useBudgetCalculations(
        incomeHook.incomes,
        fixedHook.expenses,
        variableHook.expenses,
        savingsSetting.allocationPct,
        investmentSetting.allocationPct,
    );

    const pieData = [
        { name: "Gastos fijos",   value: totalFixed,           color: COLORS.fixed      },
        { name: "Gastos del mes", value: totalVariable,        color: COLORS.variable   },
        { name: "Ahorros",        value: savingsAllocation,    color: COLORS.savings    },
        { name: "Inversiones",    value: investmentAllocation, color: COLORS.investment },
        afterExpenses >= 0
            ? { name: "Me queda libre", value: afterExpenses,           color: COLORS.accent  }
            : { name: "Déficit",        value: Math.abs(afterExpenses), color: COLORS.deficit },
    ].filter(d => d.value > 0);

    const barData = [
        { name: "Gané",           value: totalIncome,          color: COLORS.income     },
        { name: "Gastos fijos",   value: totalFixed,           color: COLORS.fixed      },
        { name: "Gastos del mes", value: totalVariable,        color: COLORS.variable   },
        { name: "Ahorros",        value: savingsAllocation,    color: COLORS.savings    },
        { name: "Inversiones",    value: investmentAllocation, color: COLORS.investment },
        {
            name:  afterExpenses >= 0 ? "Me queda libre" : "Déficit",
            value: afterExpenses,
            color: afterExpenses >= 0 ? COLORS.accent : COLORS.deficit,
        },
    ];

    if (userLoading) return null;

    if (!userId) {
        return <UserSetup onCreate={createUser} />;
    }

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
            />

            {/* KPI Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: SPACING["4"], marginBottom: SPACING["6"] }}>
                <MetricCard
                    label="Total Ingresos"
                    value={<AnimatedNumber value={totalIncome} />}
                    color={COLORS.income}
                    icon={TrendingUp}
                    subtitle="Este mes"
                />
                <MetricCard
                    label="Total Gastos"
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

            {/* Listas editables */}
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
                    icon={Target}
                    onAdd={fixedHook.add}
                    onUpdate={fixedHook.update}
                    onDelete={fixedHook.remove}
                />
                <EditableList
                    title="Gastos Variables del Mes"
                    items={variableHook.expenses}
                    color={COLORS.variable}
                    icon={BarChart2}
                    onAdd={variableHook.add}
                    onUpdate={variableHook.update}
                    onDelete={variableHook.remove}
                />
            </div>

            {/* Ahorros + Gráficas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING["4"], marginBottom: SPACING["6"] }}>
                <SavingsCard
                    title={savingsGoalHook.goal?.title ?? "Ahorros"}
                    saved={savingsGoalHook.goal?.totalContributed ?? 0}
                    goal={savingsGoalHook.goal?.goalAmount ?? 0}
                    color={COLORS.savings}
                    icon={Shield}
                    allocationPct={savingsSetting.allocationPct}
                    monthlyAllocation={savingsAllocation}
                    onAllocationPctChange={savingsSetting.upsert}
                />
                <SavingsCard
                    title={investmentGoalHook.goal?.title ?? "Inversiones"}
                    saved={investmentGoalHook.goal?.totalContributed ?? 0}
                    goal={investmentGoalHook.goal?.goalAmount ?? 0}
                    color={COLORS.investment}
                    icon={TrendingUp}
                    allocationPct={investmentSetting.allocationPct}
                    monthlyAllocation={investmentAllocation}
                    onAllocationPctChange={investmentSetting.upsert}
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
