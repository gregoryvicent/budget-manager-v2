/**
 * Utility functions for formatting numbers, currency, and percentages.
 */

/**
 * Formats a number as USD currency with two decimal places.
 *
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "$1,416.00")
 * @example
 * formatCurrency(1416) // Returns "$1,416.00"
 * formatCurrency(1416.5) // Returns "$1,416.50"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number as a percentage with two decimal places.
 *
 * @param {number} value - The percentage value to format
 * @returns {string} Formatted percentage string (e.g., "43.41%")
 * @example
 * formatPercentage(43.41) // Returns "43.41%"
 * formatPercentage(100) // Returns "100.00%"
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
