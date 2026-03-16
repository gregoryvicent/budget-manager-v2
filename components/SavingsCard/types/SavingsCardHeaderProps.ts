export interface SavingsCardHeaderProps {
    title: string;
    color: string;
    icon: React.ElementType;
    goalReached: boolean;
    allocationPct: number;
    onAllocationPctChange: (pct: number) => void;
}
