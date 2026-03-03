import MetricCard from "@/components/MetricCard";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

/**
 * Props for the MetricsGrid component.
 */
interface MetricsGridProps {
  /** Total after expenses (income - expenses - savings - investment) in USD */
  totalAfterExpenses: number;
  /** Total expenses amount in USD */
  totalExpenses: number;
  /** Percentage of income used */
  incomeUsedPercentage: number;
  /** Percentage of income for fixed expenses */
  fixedExpensesPercentage: number;
  /** Percentage of income for total expenses */
  totalExpensesPercentage: number;
  /** Percentage of free money after all expenses, savings, and investments */
  freeMoneyPercentage: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A grid component displaying the 5 main financial metrics.
 * Responsive layout: 5 columns on desktop, 2 on tablet, 1 on mobile.
 * Uses MetricCard components with appropriate formatting.
 *
 * @param {MetricsGridProps} props - The component props
 * @returns {JSX.Element} The rendered metrics grid
 * @example
 * <MetricsGrid
 *   totalIncome={1416.00}
 *   totalExpenses={584.22}
 *   incomeUsedPercentage={43.41}
 *   fixedExpensesPercentage={39.49}
 *   totalExpensesPercentage={44.79}
 * />
 */
export default function MetricsGrid({
  totalAfterExpenses,
  totalExpenses,
  incomeUsedPercentage,
  fixedExpensesPercentage,
  totalExpensesPercentage,
  freeMoneyPercentage,
  className = "",
}: MetricsGridProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Left side: Income metrics side by side, taller to match right side */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title="Total despues de gastos"
          value={formatCurrency(totalAfterExpenses)}
          variant="income"
          className="h-auto"
        />

        <MetricCard
          title="Porcentaje de Dinero Libre"
          value={formatPercentage(freeMoneyPercentage)}
          variant="savings"
          className="h-auto"
        />
      </div>

      {/* Right side: Total Gastos on top, then two percentage cards side by side */}
      <div className="space-y-4">
        <MetricCard
          title="Total de Gastos del Mes"
          value={formatCurrency(totalExpenses)}
          variant="expense"
        />

        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Porcentaje del Ingreso Mensual Destinado a Gastos Fijos"
            value={formatPercentage(fixedExpensesPercentage)}
            variant="default"
          />

          <MetricCard
            title="Porcentaje del Ingreso Mensual Destinado a Gastos Totales"
            value={formatPercentage(totalExpensesPercentage)}
            variant="expense"
          />
        </div>
      </div>
    </div>
  );
}
