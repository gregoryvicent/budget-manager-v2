export interface SavingsCardProps {
    title: string;
    saved: number;
    goal: number;
    color: string;
    icon: React.ElementType;
    allocationPct: number;
    monthlyAllocation: number;
    onAllocationPctChange: (pct: number) => void;
}
