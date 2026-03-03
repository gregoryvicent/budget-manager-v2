/**
 * Props for the ProgressBar component.
 */
interface ProgressBarProps {
  /** Progress value between 0 and 100 */
  value: number;
  /** Visual variant that determines the bar color */
  variant?: "default" | "success" | "warning" | "danger";
  /** Whether to show the percentage label */
  showLabel?: boolean;
  /** Height size of the progress bar */
  height?: "sm" | "md" | "lg";
}

/**
 * A progress bar component with customizable variants and heights.
 * Includes ARIA attributes for accessibility.
 *
 * @param {ProgressBarProps} props - The component props
 * @returns {JSX.Element} The rendered progress bar component
 * @example
 * <ProgressBar value={75} variant="success" showLabel height="md" />
 */
export default function ProgressBar({
  value,
  variant = "default",
  showLabel = false,
  height = "md",
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Define bar colors for each variant
  const variantStyles = {
    default: "bg-sage",
    success: "bg-sage",
    warning: "bg-sage-light",
    danger: "bg-sage-dark",
  };

  // Define height classes
  const heightStyles = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      <div
        className={`w-full bg-sage-dark/10 rounded-full overflow-hidden ${heightStyles[height]}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${clampedValue}%`}
      >
        <div
          className={`${variantStyles[variant]} ${heightStyles[height]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-sage-dark text-right">
          {clampedValue.toFixed(2)}%
        </div>
      )}
    </div>
  );
}
