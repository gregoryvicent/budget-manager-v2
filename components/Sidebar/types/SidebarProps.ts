export interface SidebarProps {
    open: boolean;
    onToggle: () => void;
    selectedYear: number;
    selectedMonth: number;
    onMonthSelect: (year: number, month: number) => void;
}
