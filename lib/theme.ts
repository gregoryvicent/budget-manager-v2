export const COLORS = {
    bg: "#0a0f1e",
    card: "#111827",
    cardBorder: "#1f2937",
    income: "#10b981",
    fixed: "#f59e0b",
    variable: "#ef4444",
    savings: "#3b82f6",
    investment: "#8b5cf6",
    accent: "#06b6d4",
    text: "#f9fafb",
    muted: "#6b7280",
} as const;

export type ListItem = {
    id: number;
    name: string;
    amount: number;
};

export function formatCurrency(val: number): string {
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
