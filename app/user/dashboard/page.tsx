"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, TrendingDown, DollarSign, Shield } from "lucide-react";

import AnimatedNumber from "@/components/AnimatedNumber";
import EditableList from "@/components/EditableList";
import EditableListSkeleton from "@/components/EditableList/EditableListSkeleton";
import MetricCard from "@/components/MetricCard";
import MetricCardSkeleton from "@/components/MetricCard/MetricCardSkeleton";
import GoalsList from "@/components/GoalsList";
import GoalsListSkeleton from "@/components/GoalsList/GoalsListSkeleton";
import FinancialSummaryChart from "@/components/FinancialSummaryChart";
import DistributionChart from "@/components/DistributionChart";
import ChartSkeleton from "@/components/Charts/ChartSkeleton";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { useBudgetCalculations } from "@/hooks/useBudgetCalculations";
import { useBudgetMonth } from "@/hooks/useBudgetMonth";
import { useIncomeEntries } from "@/hooks/useIncomeEntries";
import { useExpenseEntries } from "@/hooks/useExpenseEntries";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useGoalMonthSettings } from "@/hooks/useGoalMonthSettings";
import CopyItemsModal from "@/components/CopyItemsModal";
import ExpandedListModal from "@/components/ExpandedListModal";
import CurrencyProvider from "@/components/CurrencyProvider";
import { COLORS, FONTS } from "@/lib/theme";
import { getCategoryColor } from "@/lib/breakdownPalette";
import type { CopyCategory } from "@/hooks/useCopyItems";
import type { BreakdownData } from "@/components/DistributionChart/types/BreakdownData";

/**
 * Budget dashboard page. Displays income, expenses, multiple savings/investment
 * goals, and financial charts for the authenticated user.
 * Protected by middleware — only accessible at /user/dashboard.
 */
export default function BudgetDashboard() {
    const { data: session, status } = useSession();

    const [sidebarOpen, setSidebarOpen]     = useState(false);
    const [copyModal, setCopyModal] = useState<{
        open: boolean;
        category: CopyCategory;
        categoryLabel: string;
        color: string;
    } | null>(null);

    const [expandedList, setExpandedList] = useState<{
        category: "income" | "fixed" | "variable";
    } | null>(null);

    const incomeExpandRef   = useRef<HTMLButtonElement>(null);
    const fixedExpandRef    = useRef<HTMLButtonElement>(null);
    const variableExpandRef = useRef<HTMLButtonElement>(null);

    const [selectedYear, setSelectedYear]   = useState(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("budget_year");
            return saved ? Number(saved) : new Date().getFullYear();
        }
        return new Date().getFullYear();
    });
    const [selectedMonth, setSelectedMonth] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("budget_month");
            return saved ? Number(saved) : new Date().getMonth() + 1;
        }
        return new Date().getMonth() + 1;
    });

    // Persist selected month to sessionStorage
    useEffect(() => {
        sessionStorage.setItem("budget_year", String(selectedYear));
        sessionStorage.setItem("budget_month", String(selectedMonth));
    }, [selectedYear, selectedMonth]);

    /** Updates the selected month. */
    const handleMonthSelect = (year: number, month: number) => {
        setSelectedYear(year);
        setSelectedMonth(month);
    };

    const { budgetMonthId } = useBudgetMonth(selectedYear, selectedMonth);

    const incomeHook   = useIncomeEntries(budgetMonthId);
    const fixedHook    = useExpenseEntries(budgetMonthId, "FIXED");
    const variableHook = useExpenseEntries(budgetMonthId, "VARIABLE");

    const savingsHook    = useSavingsGoals("SAVINGS", budgetMonthId, selectedYear, selectedMonth);
    const investmentHook = useSavingsGoals("INVESTMENT", budgetMonthId, selectedYear, selectedMonth);
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

    /** Reloads the correct hook after a successful copy operation. */
    const handleCopySuccess = () => {
        if (!copyModal) return;
        switch (copyModal.category) {
            case "INCOME": incomeHook.reload(); break;
            case "FIXED_EXPENSE": fixedHook.reload(); break;
            case "VARIABLE_EXPENSE": variableHook.reload(); break;
        }
    };

    /** Maps the expanded category to the corresponding hook data and callbacks. */
    const getExpandedProps = () => {
        if (!expandedList) return null;
        switch (expandedList.category) {
            case "income":
                return {
                    title: "Fuentes de Ingresos",
                    items: incomeHook.incomes,
                    color: COLORS.income,
                    icon: TrendingUp,
                    onAdd: incomeHook.add,
                    onUpdate: incomeHook.update,
                    onDelete: incomeHook.remove,
                    isCreating: incomeHook.isCreating,
                    isUpdating: incomeHook.isUpdating,
                    isDeletingId: incomeHook.isDeletingId,
                    onCopyFromMonth: () => setCopyModal({ open: true, category: "INCOME", categoryLabel: "Fuentes de Ingresos", color: COLORS.income }),
                    triggerRef: incomeExpandRef,
                };
            case "fixed":
                return {
                    title: "Gastos Fijos del Mes",
                    items: fixedHook.expenses,
                    color: COLORS.fixed,
                    icon: TrendingDown,
                    onAdd: fixedHook.add,
                    onUpdate: fixedHook.update,
                    onDelete: fixedHook.remove,
                    isCreating: fixedHook.isCreating,
                    isUpdating: fixedHook.isUpdating,
                    isDeletingId: fixedHook.isDeletingId,
                    onCopyFromMonth: () => setCopyModal({ open: true, category: "FIXED_EXPENSE", categoryLabel: "Gastos Fijos del Mes", color: COLORS.fixed }),
                    triggerRef: fixedExpandRef,
                };
            case "variable":
                return {
                    title: "Gastos Variables del Mes",
                    items: variableHook.expenses,
                    color: COLORS.variable,
                    icon: TrendingDown,
                    onAdd: variableHook.add,
                    onUpdate: variableHook.update,
                    onDelete: variableHook.remove,
                    isCreating: variableHook.isCreating,
                    isUpdating: variableHook.isUpdating,
                    isDeletingId: variableHook.isDeletingId,
                    onCopyFromMonth: () => setCopyModal({ open: true, category: "VARIABLE_EXPENSE", categoryLabel: "Gastos Variables del Mes", color: COLORS.variable }),
                    triggerRef: variableExpandRef,
                };
        }
    };

    const expandedProps = getExpandedProps();

    if (status === "loading") return null;

    return (
        <CurrencyProvider>
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
                {(incomeHook.loading || !budgetMonthId) && incomeHook.incomes.length === 0 ? (
                    <>
                        <MetricCardSkeleton />
                        <MetricCardSkeleton />
                        <MetricCardSkeleton />
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>

            {/* Editable lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {(incomeHook.loading || !budgetMonthId) && incomeHook.incomes.length === 0 ? (
                    <EditableListSkeleton />
                ) : (
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
                        onCopyFromMonth={() => setCopyModal({ open: true, category: "INCOME", categoryLabel: "Fuentes de Ingresos", color: COLORS.income })}
                        onExpand={() => setExpandedList({ category: "income" })}
                        expandTriggerRef={incomeExpandRef}
                    />
                )}
                {(fixedHook.loading || !budgetMonthId) && fixedHook.expenses.length === 0 ? (
                    <EditableListSkeleton />
                ) : (
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
                        onCopyFromMonth={() => setCopyModal({ open: true, category: "FIXED_EXPENSE", categoryLabel: "Gastos Fijos del Mes", color: COLORS.fixed })}
                        onExpand={() => setExpandedList({ category: "fixed" })}
                        expandTriggerRef={fixedExpandRef}
                    />
                )}
                {(variableHook.loading || !budgetMonthId) && variableHook.expenses.length === 0 ? (
                    <EditableListSkeleton />
                ) : (
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
                        onCopyFromMonth={() => setCopyModal({ open: true, category: "VARIABLE_EXPENSE", categoryLabel: "Gastos Variables del Mes", color: COLORS.variable })}
                        onExpand={() => setExpandedList({ category: "variable" })}
                        expandTriggerRef={variableExpandRef}
                    />
                )}
            </div>

            {/* Goals + Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-stretch">
                {savingsHook.loading && savingsHook.goals.length === 0 ? (
                    <GoalsListSkeleton />
                ) : (
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
                        unassignedGoals={savingsHook.unassignedGoals}
                        onAssign={async (goalId) => {
                            await savingsHook.assign(goalId);
                            await goalSettings.reload();
                        }}
                        onUnlink={savingsHook.unlink}
                        isAssigning={savingsHook.isAssigning}
                        isUnlinkingId={savingsHook.isUnlinkingId}
                        settingIds={goalSettings.settingIds}
                    />
                )}
                {investmentHook.loading && investmentHook.goals.length === 0 ? (
                    <GoalsListSkeleton />
                ) : (
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
                        unassignedGoals={investmentHook.unassignedGoals}
                        onAssign={async (goalId) => {
                            await investmentHook.assign(goalId);
                            await goalSettings.reload();
                        }}
                        onUnlink={investmentHook.unlink}
                        isAssigning={investmentHook.isAssigning}
                        isUnlinkingId={investmentHook.isUnlinkingId}
                        settingIds={goalSettings.settingIds}
                    />
                )}
                {(incomeHook.loading || !budgetMonthId) && incomeHook.incomes.length === 0 ? (
                    <ChartSkeleton variant="bar" />
                ) : (
                    <FinancialSummaryChart data={barData} totalIncome={totalIncome} />
                )}
                {(incomeHook.loading || !budgetMonthId) && incomeHook.incomes.length === 0 ? (
                    <ChartSkeleton variant="donut" />
                ) : (
                    <DistributionChart data={pieData} totalIncome={totalIncome} breakdownData={breakdownData} />
                )}
            </div>

            <Sidebar
                open={sidebarOpen}
                onToggle={() => setSidebarOpen(o => !o)}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onMonthSelect={handleMonthSelect}
            />

            {copyModal && budgetMonthId && (
                <CopyItemsModal
                    open={copyModal.open}
                    onClose={() => setCopyModal(null)}
                    category={copyModal.category}
                    categoryLabel={copyModal.categoryLabel}
                    color={copyModal.color}
                    budgetMonthId={budgetMonthId}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    onCopySuccess={handleCopySuccess}
                />
            )}

            {expandedProps && (
                <ExpandedListModal
                    open={expandedList !== null}
                    onClose={() => setExpandedList(null)}
                    {...expandedProps}
                />
            )}
        </div>
        </CurrencyProvider>
    );
}
