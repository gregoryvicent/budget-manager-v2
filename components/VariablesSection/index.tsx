import Card from "@/components/Card";
import { Heading, Label, Value } from "@/components/Typography";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

/**
 * Represents a variable with its value and type.
 */
export interface Variable {
  /** Unique identifier for the variable */
  id: string;
  /** Name/description of the variable */
  name: string;
  /** Value of the variable */
  value: number | string;
  /** Type of value for formatting */
  type: "currency" | "percentage" | "number";
}

/**
 * Props for the VariablesSection component.
 */
interface VariablesSectionProps {
  /** Array of variables to display */
  variables: Variable[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Formats a variable value based on its type.
 *
 * @param {number | string} value - The value to format
 * @param {"currency" | "percentage" | "number"} type - The type of formatting to apply
 * @returns {string} The formatted value
 */
function formatVariableValue(
  value: number | string,
  type: "currency" | "percentage" | "number"
): string {
  if (typeof value === "string") {
    return value;
  }

  switch (type) {
    case "currency":
      return formatCurrency(value);
    case "percentage":
      return formatPercentage(value);
    case "number":
      return value.toLocaleString("en-US");
    default:
      return String(value);
  }
}

/**
 * Section component for displaying auxiliary variables.
 * Shows a list of variables with appropriate formatting based on type.
 * Uses Card with default variant for visual distinction.
 *
 * @param {VariablesSectionProps} props - The component props
 * @returns {JSX.Element} The rendered variables section
 * @example
 * <VariablesSection
 *   variables={[
 *     { id: '1', name: 'Ingreso Disponible', value: 831.78, type: 'currency' },
 *     { id: '2', name: 'Tasa de Ahorro', value: 11.80, type: 'percentage' },
 *     { id: '3', name: 'Días del Mes', value: 30, type: 'number' }
 *   ]}
 * />
 */
export default function VariablesSection({
  variables,
  className = "",
}: VariablesSectionProps) {
  return (
    <Card variant="default" className={className}>
      <div className="space-y-4">
        <Heading level={2}>Variables Adicionales</Heading>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {variables.map((variable) => (
            <div
              key={variable.id}
              className="p-4 rounded-lg bg-cream border border-sage/20 transition-all duration-200 hover:border-sage/40"
            >
              <Label className="text-sage-dark/70 block mb-2">
                {variable.name}
              </Label>
              <Value size="sm">
                {formatVariableValue(variable.value, variable.type)}
              </Value>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
