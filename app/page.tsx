"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Target, Shield, BarChart2, Wallet } from "lucide-react";

import AnimatedNumber from "@/components/AnimatedNumber";
import EditableList from "@/components/EditableList";
import MetricCard from "@/components/MetricCard";
import SavingsCard from "@/components/SavingsCard";
import FinancialSummaryChart from "@/components/FinancialSummaryChart";
import DistributionChart from "@/components/DistributionChart";
import { COLORS, formatCurrency, type ListItem } from "@/lib/theme";

const initialIncomes: ListItem[] = [
    { id: 1, name: "Salario EMQU", amount: 850 },
];

const initialFixedExpenses: ListItem[] = [
    { id: 1, name: "Renta departamento", amount: 280.14 },
    { id: 2, name: "Servicio de Internet", amount: 17.5 },
    { id: 3, name: "Renta del teléfono", amount: 14 },
    { id: 4, name: "Comida para la casa", amount: 200 },
    { id: 5, name: "Mantenimiento bancolombia", amount: 8 },
    { id: 6, name: "Gas, Agua, Electricidad", amount: 110 },
    { id: 7, name: "Prime Video + Max", amount: 7 },
];

const initialVariableExpenses: ListItem[] = [
    { id: 1, name: "Deposito de la nueva casa", amount: 140 },
];

const EMERGENCY_GOAL = 2000;
const EMERGENCY_SAVED = 560.3;
const INVESTMENT_GOAL = 5000;
const INVESTMENT_SAVED = 0;

export default function BudgetDashboard() {
    const [incomes, setIncomes] = useState<ListItem[]>(initialIncomes);
    const [fixedExpenses, setFixedExpenses] = useState<ListItem[]>(initialFixedExpenses);
    const [variableExpenses, setVariableExpenses] = useState<ListItem[]>(initialVariableExpenses);

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalFixed = fixedExpenses.reduce((s, i) => s + i.amount, 0);
    const totalVariable = variableExpenses.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = totalFixed + totalVariable;
    const afterExpenses = totalIncome - totalExpenses;

    const freePct = totalIncome > 0 ? (afterExpenses / totalIncome) * 100 : 0;
    const fixedPct = totalIncome > 0 ? (totalFixed / totalIncome) * 100 : 0;
    const totalExpPct = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    const pieData = [
        { name: "Gastos Fijos", value: totalFixed },
        { name: "Gastos Variables", value: totalVariable },
        { name: "Libre", value: Math.max(afterExpenses, 0) },
    ];

    const barData = [
        { name: "Ingresos", value: totalIncome, color: COLORS.income },
        { name: "G. Fijos", value: totalFixed, color: COLORS.fixed },
        { name: "G. Variables", value: totalVariable, color: COLORS.variable },
        { name: "Disponible", value: Math.max(afterExpenses, 0), color: COLORS.accent },
    ];

    const bottomMetrics = [
        { label: "Dinero Disponible", value: formatCurrency(afterExpenses), color: COLORS.accent, pct: freePct },
        { label: "% del Ingreso Libre", value: `${freePct.toFixed(2)}%`, color: COLORS.income, pct: freePct },
        { label: "Gastos Fijos / Ingreso", value: `${fixedPct.toFixed(2)}%`, color: COLORS.fixed, pct: fixedPct },
        { label: "Gastos Totales / Ingreso", value: `${totalExpPct.toFixed(2)}%`, color: COLORS.variable, pct: totalExpPct },
    ];

    return (
        <div style={{
            minHeight: "100vh",
            background: COLORS.bg,
            fontFamily: "'DM Sans', sans-serif",
            padding: "24px",
            boxSizing: "border-box",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                input::placeholder { color: #4b5563; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #0a0f1e; }
                ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 3px; }
            `}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.investment})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Wallet size={20} color="#fff" />
                        </div>
                        <h1 style={{
                            margin: 0, fontSize: 22, fontWeight: 800,
                            fontFamily: "'Sora', sans-serif", color: COLORS.text,
                            background: `linear-gradient(90deg, #f9fafb, ${COLORS.accent})`,
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>
                            Budget Dashboard
                        </h1>
                    </div>
                    <p style={{ margin: "4px 0 0 50px", color: COLORS.muted, fontSize: 13 }}>
                        Control financiero personal · {new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
                    </p>
                </div>
                <div style={{
                    padding: "10px 20px", borderRadius: 12,
                    background: afterExpenses >= 0 ? COLORS.income + "22" : COLORS.variable + "22",
                    border: `1px solid ${afterExpenses >= 0 ? COLORS.income : COLORS.variable}44`,
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    {afterExpenses >= 0
                        ? <TrendingUp size={16} color={COLORS.income} />
                        : <TrendingDown size={16} color={COLORS.variable} />
                    }
                    <span style={{
                        color: afterExpenses >= 0 ? COLORS.income : COLORS.variable,
                        fontWeight: 700, fontFamily: "'Sora', sans-serif", fontSize: 14,
                    }}>
                        {afterExpenses >= 0 ? "Balance Positivo" : "Balance Negativo"}
                    </span>
                </div>
            </div>

            {/* KPI Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
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
                <MetricCard
                    label="% Gastos Fijos"
                    value={`${fixedPct.toFixed(1)}%`}
                    color={COLORS.fixed}
                    icon={BarChart2}
                    subtitle="Del ingreso mensual"
                />
            </div>

            {/* Listas editables */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                <EditableList
                    title="Fuentes de Ingresos"
                    items={incomes}
                    color={COLORS.income}
                    icon={TrendingUp}
                    onItemsChange={setIncomes}
                />
                <EditableList
                    title="Gastos Mensuales Fijos"
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

            {/* Gráficas + Ahorros */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                <FinancialSummaryChart data={barData} />
                <DistributionChart data={pieData} />
                <SavingsCard
                    title="Fondo de Emergencia"
                    saved={EMERGENCY_SAVED}
                    goal={EMERGENCY_GOAL}
                    color={COLORS.savings}
                    icon={Shield}
                />
                <SavingsCard
                    title="Capital de Inversión"
                    saved={INVESTMENT_SAVED}
                    goal={INVESTMENT_GOAL}
                    color={COLORS.investment}
                    icon={TrendingUp}
                />
            </div>

            {/* Métricas inferiores */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {bottomMetrics.map((m, i) => (
                    <div key={i} style={{
                        background: COLORS.card,
                        border: `1px solid ${COLORS.cardBorder}`,
                        borderRadius: 16,
                        padding: 20,
                    }}>
                        <div style={{ color: COLORS.muted, fontSize: 11, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                            {m.label}
                        </div>
                        <div style={{ color: m.color, fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
                            {m.value}
                        </div>
                        <div style={{ height: 4, borderRadius: 4, background: "#1f2937", overflow: "hidden" }}>
                            <div style={{
                                height: "100%", borderRadius: 4,
                                width: `${Math.min(m.pct, 100)}%`,
                                background: m.color,
                                transition: "width 1s ease",
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
