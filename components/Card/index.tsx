import type { ReactNode } from "react";

/**
 * Props for the Card component.
 */
interface CardProps {
  /** Content to be rendered inside the card */
  children: ReactNode;
  /** Visual variant of the card that determines its background color */
  variant?: "default" | "income" | "expense" | "savings";
  /** Additional CSS classes to apply to the card */
  className?: string;
}

/**
 * A reusable card component with different visual variants.
 * Provides a consistent container with rounded corners, padding, and shadow effects.
 *
 * @param {CardProps} props - The component props
 * @returns {JSX.Element} The rendered card component
 * @example
 * <Card variant="income">
 *   <h2>Income Sources</h2>
 *   <p>Content goes here</p>
 * </Card>
 */
export default function Card({
  children,
  variant = "default",
  className = "",
}: CardProps) {
  // Define background colors for each variant - all cards use cream color
  const variantStyles = {
    default: "bg-cream dark:bg-charcoal border border-sage/40 dark:border-sage/40",
    income: "bg-cream dark:bg-charcoal border border-sage/40 dark:border-sage/40",
    expense: "bg-cream dark:bg-charcoal border border-sage/40 dark:border-sage/40",
    savings: "bg-cream dark:bg-charcoal border border-sage/40 dark:border-sage/40",
  };

  return (
    <div
      className={`rounded-xl p-4 shadow-sm transition-shadow duration-200 hover:shadow-md ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
