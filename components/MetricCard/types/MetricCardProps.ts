export interface MetricCardProps {
    label: string;
    value: React.ReactNode;
    color: string;
    icon: React.ElementType;
    subtitle?: string;
    trend?: "up" | "down";
}
