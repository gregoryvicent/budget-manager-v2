import Card from "@/components/Card";
import { Heading, Label, Value } from "@/components/Typography";
import { formatCurrency } from "@/lib/formatters";

/**
 * Represents a single expense item.
 */
export interface ExpenseItem {
  /** Unique identifier for the expense item */
  id: string;
  /** Name/description of the expense */
  name: string;
  /** Amount in USD */
  amount: number;
  /** Type of expense */
  type: "fixed" | "variable";
}

/**
 * Props for the ExpensesSection component.
 */
interface ExpensesSectionProps {
  /** Array of fixed expense items */
  fixedExpenses: ExpenseItem[];
  /** Array of variable expense items */
  variableExpenses: ExpenseItem[];
  /** Total fixed expenses amount in USD */
  fixedTotal: number;
  /** Total variable expenses amount in USD */
  variableTotal: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Section component for displaying fixed and variable expenses.
 * Shows two sub-sections with lists of expenses and their totals.
 * Uses Card with expense variant for visual distinction.
 *
 * @param {ExpensesSectionProps} props - The component props
 * @returns {JSX.Element} The rendered expenses section
 * @example
 * <ExpensesSection
 *   fixedExpenses={[{ id: '1', name: 'Renta', amount: 315.22, type: 'fixed' }]}
 *   variableExpenses={[{ id: '2', name: 'Comida', amount: 50.00, type: 'variable' }]}
 *   fixedTotal={315.22}
 *   variableTotal={50.00}
 * />
 */
export default function ExpensesSection({
  fixedExpenses,
  variableExpenses,
  fixedTotal,
  variableTotal,
  className = "",
}: ExpensesSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Fixed Expenses */}
      <Card variant="expense">
        <div className="space-y-4">
          <Heading level={2}>Gastos Mensuales Fijos</Heading>

          <div className="space-y-3">
            {fixedExpenses.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 px-3 rounded-lg transition-all duration-200 hover:bg-sage-dark/5"
              >
                <Label className="text-sage-dark">{item.name}</Label>
                <Value size="sm">{formatCurrency(item.amount)}</Value>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-sage-dark/20">
            <div className="flex justify-between items-center">
              <Heading level={3}>Total</Heading>
              <Value size="md">{formatCurrency(fixedTotal)}</Value>
            </div>
          </div>
        </div>
      </Card>

      {/* Variable Expenses */}
      <Card variant="expense">
        <div className="space-y-4">
          <Heading level={2}>Gastos Variables del Mes</Heading>

          <div className="space-y-3">
            {variableExpenses.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 px-3 rounded-lg transition-all duration-200 hover:bg-sage-dark/5"
              >
                <Label className="text-sage-dark">{item.name}</Label>
                <Value size="sm">{formatCurrency(item.amount)}</Value>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-sage-dark/20">
            <div className="flex justify-between items-center">
              <Heading level={3}>Total</Heading>
              <Value size="md">{formatCurrency(variableTotal)}</Value>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
