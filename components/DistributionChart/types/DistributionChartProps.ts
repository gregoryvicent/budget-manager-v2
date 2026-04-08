import { type PieDataItem } from "./PieDataItem";
import { type BreakdownData } from "./BreakdownData";

export interface DistributionChartProps {
    data: PieDataItem[];
    totalIncome: number;
    breakdownData?: BreakdownData;
}
