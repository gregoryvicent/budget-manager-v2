/**
 * Category-specific color palettes for breakdown donut chart slices.
 * Each palette uses tonal variations of a base hue so that each donut
 * visually communicates its budget category at a glance.
 *
 * All colors are chosen for adequate contrast against the dark card
 * background (#111827).
 */

/** Green tones — income sources */
export const INCOME_PALETTE = [
  "#34d399", // emerald-400
  "#6ee7b7", // emerald-300
  "#10b981", // emerald-500
  "#a7f3d0", // emerald-200
  "#059669", // emerald-600
  "#4ade80", // green-400
  "#86efac", // green-300
  "#22c55e", // green-500
  "#bbf7d0", // green-200
  "#16a34a", // green-600
] as const;

/** Red / orange / amber tones — all expenses (fixed + variable unified) */
export const EXPENSE_PALETTE = [
  "#fb923c", // orange-400
  "#f87171", // red-400
  "#fbbf24", // amber-400
  "#fb7185", // rose-400
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#f59e0b", // amber-500
  "#f43f5e", // rose-500
  "#fdba74", // orange-300
  "#fca5a5", // red-300
  "#fcd34d", // amber-300
  "#fda4af", // rose-300
  "#ea580c", // orange-600
  "#dc2626", // red-600
  "#d97706", // amber-600
  "#e11d48", // rose-600
] as const;

/** Blue / sky tones — savings goals */
export const SAVINGS_PALETTE = [
  "#60a5fa", // blue-400
  "#3b82f6", // blue-500
  "#93c5fd", // blue-300
  "#38bdf8", // sky-400
  "#0ea5e9", // sky-500
  "#7dd3fc", // sky-300
  "#2563eb", // blue-600
  "#0284c7", // sky-600
  "#bfdbfe", // blue-200
  "#bae6fd", // sky-200
] as const;

/** Purple / violet tones — investment goals */
export const INVESTMENT_PALETTE = [
  "#a78bfa", // violet-400
  "#8b5cf6", // violet-500
  "#c4b5fd", // violet-300
  "#c084fc", // purple-400
  "#a855f7", // purple-500
  "#d8b4fe", // purple-300
  "#7c3aed", // violet-600
  "#9333ea", // purple-600
  "#ddd6fe", // violet-200
  "#e9d5ff", // purple-200
] as const;

/**
 * Union of all category palettes. Kept for backward-compatibility with
 * property tests that reference a single flat palette.
 */
export const BREAKDOWN_PALETTE = [
  ...INCOME_PALETTE.slice(0, 2),
  ...EXPENSE_PALETTE.slice(0, 4),
  ...SAVINGS_PALETTE.slice(0, 2),
  ...INVESTMENT_PALETTE.slice(0, 2),
] as const;

/** All individual category palettes keyed by budget category. */
export const CATEGORY_PALETTES = {
  incomes: INCOME_PALETTE,
  expenses: EXPENSE_PALETTE,
  savings: SAVINGS_PALETTE,
  investments: INVESTMENT_PALETTE,
} as const;

export type CategoryKey = keyof typeof CATEGORY_PALETTES;

/**
 * Returns a color from the general breakdown palette, cycling via modulo.
 *
 * @param index - Non-negative integer index
 * @returns A hex color string from BREAKDOWN_PALETTE
 */
export const getBreakdownColor = (index: number): string =>
  BREAKDOWN_PALETTE[index % BREAKDOWN_PALETTE.length];

/**
 * Returns a color from a category-specific palette, cycling via modulo.
 *
 * @param category - Budget category key
 * @param index - Non-negative integer index
 * @returns A hex color string from the category palette
 */
export const getCategoryColor = (category: CategoryKey, index: number): string => {
  const palette = CATEGORY_PALETTES[category];
  return palette[index % palette.length];
};
