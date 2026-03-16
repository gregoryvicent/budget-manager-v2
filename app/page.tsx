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
import { useBudgetCalculations } from "@/hooks/useBudgetCalculations";
import { COLORS, FONTS, SPACING } from "@/lib/theme";
import { type ListItem } from "@/lib/types";

const initialIncomes: ListItem[] = [
    { id: 1, name: "Salario EMQU", amount: 850 },
];

const initialFixedExpenses: ListItem[] = [
    { id: 1, name: "Renta departamento",      amount: 280.14 },
    { id: 2, name: "Servicio de Internet",     amount: 17.5  },
    { id: 3, name: "Renta del teléfono",       amount: 14    },
    { id: 4, name: "Comida para la casa",      amount: 200   },
    { id: 5, name: "Mantenimiento bancolombia", amount: 8    },
    { id: 6, name: "Gas, Agua, Electricidad",  amount: 110   },
    { id: 7, name: "Prime Video + Max",        amount: 7     },
];

const initialVariableExpenses: ListItem[] = [
    { id: 1, name: "Deposito de la nueva casa", amount: 140 },
];

const EMERGENCY_GOAL   = 2000;
const EMERGENCY_SAVED  = 560.3;
const INVESTMENT_GOAL  = 5000;
const INVESTMENT_SAVED = 0;

export default function BudgetDashboard() {
    const [incomes, setIncomes]                 = useState<ListItem[]>(initialIncomes);
    const [fixedExpenses, setFixedExpenses]     = useState<ListItem[]>(initialFixedExpenses);
    const [variableExpenses, setVariableExpenses] = useState<ListItem[]>(initialVariableExpenses);
    const [savingsPct, setSavingsPct]           = useState(10);
    const [investmentPct, setInvestmentPct]     = useState(10);
    const [sidebarOpen, setSidebarOpen]         = useState(false);
    const [selectedYear, setSelectedYear]       = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth]     = useState(new Date().getMonth());

    const {
        totalIncome, totalFixed, totalVariable, totalExpenses,
        savingsAllocation, investmentAllocation, afterExpenses,
        freePct, totalExpPct,
    } = useBudgetCalculations(incomes, fixedExpenses, variableExpenses, savingsPct, investmentPct);

    const pieData = [
        { name: "Gastos fijos",   value: totalFixed,           color: COLORS.fixed      },
        { name: "Gastos del mes", value: totalVariable,        color: COLORS.variable   },
        { name: "Ahorros",        value: savingsAllocation,    color: COLORS.savings    },
        { name: "Inversiones",    value: investmentAllocation, color: COLORS.investment },
        afterExpenses >= 0
            ? { name: "Me queda libre", value: afterExpenses,              color: COLORS.accent  }
            : { name: "Déficit",        value: Math.abs(afterExpenses),    color: COLORS.deficit },
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
                    items={incomes}
                    color={COLORS.income}
                    icon={TrendingUp}
                    onItemsChange={setIncomes}
                />
                <EditableList
                    title="Gastos Fijos del Mes"
                    items={fixedExpenses}
                    color={COLORS.fixed}
                    icon={Target}
                    onItemsChange={setFixedExpenses}
                />
                <EditableList
                    title="Gastos Variables del Mes"
                    items={variableExpenses}
                    color={COLORS.variable}
                    icon={BarChart2}
                    onItemsChange={setVariableExpenses}
                />
            </div>

            {/* Ahorros + Gráficas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING["4"], marginBottom: SPACING["6"] }}>
                <SavingsCard
                    title="Ahorros"
                    saved={EMERGENCY_SAVED}
                    goal={EMERGENCY_GOAL}
                    color={COLORS.savings}
                    icon={Shield}
                    allocationPct={savingsPct}
                    monthlyAllocation={savingsAllocation}
                    onAllocationPctChange={setSavingsPct}
                />
                <SavingsCard
                    title="Inversiones"
                    saved={INVESTMENT_SAVED}
                    goal={INVESTMENT_GOAL}
                    color={COLORS.investment}
                    icon={TrendingUp}
                    allocationPct={investmentPct}
                    monthlyAllocation={investmentAllocation}
                    onAllocationPctChange={setInvestmentPct}
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
