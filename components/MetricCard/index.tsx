import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import { Heading, Value, Text } from "@/components/Typography";

/**
 * Props for the MetricCard component.
 */
interface MetricCardProps {
  /** Title of the metric */
  title: string;
  /** Primary value to display */
  value: string | number;
  /** Optional secondary value or comparison */
  secondaryValue?: string | number;
  /** Visual variant that determines card styling */
  variant?: "default" | "income" | "expense" | "savings";
  /** Whether to show a progress bar */
  showProgress?: boolean;
  /** Progress value (0-100) when showProgress is true */
  progressValue?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A metric card component for displaying key financial metrics.
 * Combines Card, Typography, and optionally ProgressBar components.
 * Supports different visual variants and optional progress indicators.
 *
 * @param {MetricCardProps} props - The component props
 * @returns {JSX.Element} The rendered metric card
 * @example
 * <MetricCard
 *   title="Total Income"
 *   value="$1,416.00"
 *   variant="income"
 * />
 * @example
 * <MetricCard
 *   title="Income Used"
 *   value="43.41%"
 *   showProgress
 *   progressValue={43.41}
 *   variant="default"
 * />
 */
export default function MetricCard({
  title,
  value,
  secondaryValue,
  variant = "default",
  showProgress = false,
  progressValue = 0,
  className = "",
}: MetricCardProps) {
  return (
    <Card variant={variant} className={`h-32 flex items-center ${className}`}>
      <div className="space-y-2 w-full">
        <Heading level={3} className="text-charcoal/70 text-xs">
          {title}
        </Heading>
        
        <div className="space-y-1">
          <Value size="lg">{value}</Value>
          
          {secondaryValue && (
            <Text size="sm" className="text-charcoal/60">
              {secondaryValue}
            </Text>
          )}
        </div>

        {showProgress && (
          <ProgressBar
            value={progressValue}
            variant="default"
            height="md"
          />
        )}
      </div>
    </Card>
  );
}
