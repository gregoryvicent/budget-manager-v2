import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { COLORS } from "@/lib/theme";

interface MetricCardProps {
    label: string;
    value: React.ReactNode;
    color: string;
    icon: React.ElementType;
    subtitle?: string;
    trend?: "up" | "down";
}

export default function MetricCard({ label, value, color, icon: Icon, subtitle, trend }: MetricCardProps) {
    return (
        <div style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            gap: 20,
        }}>
            {/* Icono */}
            <div style={{
                background: color + "18",
                border: `1px solid ${color}30`,
                borderRadius: 14,
                padding: 14,
                flexShrink: 0,
            }}>
                <Icon size={22} color={color} />
            </div>

            {/* Contenido */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    color: COLORS.muted,
                    fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                }}>
                    {label}
                </div>
                <div style={{
                    color: COLORS.text,
                    fontWeight: 800,
                    fontSize: 28,
                    fontFamily: "'Sora', sans-serif",
                    lineHeight: 1,
                    marginBottom: 6,
                }}>
                    {value}
                </div>
                {subtitle && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {trend === "up" && <ArrowUpRight size={13} color={COLORS.income} />}
                        {trend === "down" && <ArrowDownRight size={13} color={COLORS.variable} />}
                        <span style={{
                            color: trend === "up" ? COLORS.income : trend === "down" ? COLORS.variable : COLORS.muted,
                            fontSize: 12,
                            fontFamily: "'DM Sans', sans-serif",
                        }}>
                            {subtitle}
                        </span>
                    </div>
                )}
            </div>

            {/* Barra lateral de color */}
            <div style={{
                width: 3,
                alignSelf: "stretch",
                borderRadius: 4,
                background: `linear-gradient(180deg, ${color}, ${color}33)`,
                flexShrink: 0,
            }} />
        </div>
    );
}
