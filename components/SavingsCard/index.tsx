import { useState } from "react";
import ProgressRing from "@/components/ProgressRing";
import { COLORS, formatCurrency } from "@/lib/theme";

interface SavingsCardProps {
    title: string;
    saved: number;
    goal: number;
    color: string;
    icon: React.ElementType;
    allocationPct: number;
    monthlyAllocation: number;
    onAllocationPctChange: (pct: number) => void;
}

export default function SavingsCard({
    title,
    saved,
    goal,
    color,
    icon: Icon,
    allocationPct,
    monthlyAllocation,
    onAllocationPctChange,
}: SavingsCardProps) {
    const [inputValue, setInputValue] = useState(String(allocationPct));
    const pct = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;
    const remaining = Math.max(goal - saved, 0);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        // Solo permite dígitos y un único punto decimal
        if (!/^\d*\.?\d*$/.test(raw)) return;
        // No permite exceder 100
        if (raw !== "" && parseFloat(raw) > 100) return;
        setInputValue(raw);
    }

    function handleBlur() {
        const parsed = parseFloat(inputValue);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            onAllocationPctChange(parsed);
            setInputValue(String(parsed));
        } else {
            setInputValue(String(allocationPct));
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        // Bloquea cualquier tecla que no sea: dígito, punto, backspace, delete, flechas, tab
        const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "."];
        if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
    }

    return (
        <div style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
        }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        background: color + "20",
                        borderRadius: 10,
                        padding: 8,
                        border: `1px solid ${color}30`,
                    }}>
                        <Icon size={16} color={color} />
                    </div>
                    <span style={{
                        color: COLORS.text,
                        fontWeight: 700,
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 15,
                    }}>
                        {title}
                    </span>
                </div>

                {/* % del ingreso editable */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: color + "12",
                    border: `1px solid ${color}30`,
                    borderRadius: 10,
                    padding: "5px 10px",
                }}>
                    <span style={{ color: COLORS.muted, fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>
                        del ingreso
                    </span>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={inputValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        style={{
                            width: 38,
                            background: "transparent",
                            border: "none",
                            color,
                            fontWeight: 800,
                            fontSize: 14,
                            fontFamily: "'Sora', sans-serif",
                            textAlign: "center",
                            padding: 0,
                            outline: "none",
                        }}
                    />
                    <span style={{ color, fontWeight: 700, fontSize: 13, fontFamily: "'Sora', sans-serif" }}>%</span>
                </div>
            </div>

            {/* Cuerpo: ring + datos */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {/* Ring con % en el centro */}
                <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ProgressRing pct={pct} color={color} size={96} stroke={8} />
                    <div style={{ position: "absolute", textAlign: "center" }}>
                        <div style={{ color, fontWeight: 800, fontSize: 15, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>
                            {pct.toFixed(0)}%
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: 9, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                            meta
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Ahorrado */}
                    <div>
                        <div style={{ color: COLORS.muted, fontSize: 10, fontFamily: "'DM Sans', sans-serif", marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Ahorrado
                        </div>
                        <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 22, fontFamily: "'Sora', sans-serif", lineHeight: 1.1 }}>
                            {formatCurrency(saved)}
                        </div>
                    </div>

                    {/* Separador de dos cols */}
                    <div style={{ display: "flex", gap: 16 }}>
                        <div>
                            <div style={{ color: COLORS.muted, fontSize: 10, fontFamily: "'DM Sans', sans-serif", marginBottom: 1 }}>
                                Meta
                            </div>
                            <div style={{ color: COLORS.text, fontWeight: 600, fontSize: 13, fontFamily: "'Sora', sans-serif" }}>
                                {formatCurrency(goal)}
                            </div>
                        </div>
                        <div style={{ width: 1, background: COLORS.cardBorder }} />
                        <div>
                            <div style={{ color: COLORS.muted, fontSize: 10, fontFamily: "'DM Sans', sans-serif", marginBottom: 1 }}>
                                Mensual
                            </div>
                            <div style={{ color, fontWeight: 700, fontSize: 13, fontFamily: "'Sora', sans-serif" }}>
                                {formatCurrency(monthlyAllocation)}
                            </div>
                        </div>
                        <div style={{ width: 1, background: COLORS.cardBorder }} />
                        <div>
                            <div style={{ color: COLORS.muted, fontSize: 10, fontFamily: "'DM Sans', sans-serif", marginBottom: 1 }}>
                                Restante
                            </div>
                            <div style={{ color: COLORS.muted, fontWeight: 600, fontSize: 13, fontFamily: "'Sora', sans-serif" }}>
                                {formatCurrency(remaining)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de progreso inferior */}
            <div style={{ height: 5, borderRadius: 4, background: "#1f2937", overflow: "hidden" }}>
                <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    transition: "width 1s ease",
                }} />
            </div>
        </div>
    );
}
