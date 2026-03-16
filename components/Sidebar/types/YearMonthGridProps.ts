export interface YearMonthGridProps {
    year: number;
    currentYear: number;
    currentMonth: number;
    selectedYear: number;
    selectedMonth: number;
    onSelect: (year: number, month: number) => void;
}
