export interface YearMonthGridProps {
    year: number;
    selectedYear: number;
    selectedMonth: number;
    onSelect: (year: number, month: number) => void;
}
