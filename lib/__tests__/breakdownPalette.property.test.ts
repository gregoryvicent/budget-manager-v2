import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  BREAKDOWN_PALETTE,
  getBreakdownColor,
  CATEGORY_PALETTES,
  getCategoryColor,
  INCOME_PALETTE,
  EXPENSE_PALETTE,
  SAVINGS_PALETTE,
  INVESTMENT_PALETTE,
} from "@/lib/breakdownPalette";
import type { CategoryKey } from "@/lib/breakdownPalette";
import { COLORS } from "@/lib/theme";

/**
 * Parses a hex color string (#RRGGBB) into its RGB components.
 *
 * @param hex - Color in "#RRGGBB" format
 * @returns Tuple of [r, g, b] in 0-255 range
 */
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/**
 * Converts an sRGB channel value (0-255) to its relative luminance component.
 * Uses the sRGB linearization formula per WCAG 2.x.
 *
 * @param channel - sRGB value in 0-255 range
 * @returns Linear luminance component
 */
function srgbToLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Calculates relative luminance of a color per WCAG 2.x definition.
 *
 * @param hex - Color in "#RRGGBB" format
 * @returns Relative luminance (0 to 1)
 */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/**
 * Calculates the WCAG contrast ratio between two colors.
 *
 * @param hex1 - First color in "#RRGGBB" format
 * @param hex2 - Second color in "#RRGGBB" format
 * @returns Contrast ratio (1 to 21)
 */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** All individual category palettes flattened for contrast testing. */
const ALL_CATEGORY_COLORS = [
  ...INCOME_PALETTE,
  ...EXPENSE_PALETTE,
  ...SAVINGS_PALETTE,
  ...INVESTMENT_PALETTE,
];

const CATEGORY_KEYS: CategoryKey[] = Object.keys(CATEGORY_PALETTES) as CategoryKey[];

// Feature: distribution-detail-modal, Property 4: Asignación de colores desde la paleta con ciclado
describe("Property 4: Palette color assignment with cycling", () => {
  it("getBreakdownColor returns a value belonging to BREAKDOWN_PALETTE for any non-negative index", () => {
    fc.assert(
      fc.property(fc.nat(), (index) => {
        const color = getBreakdownColor(index);
        expect(BREAKDOWN_PALETTE).toContain(color);
      }),
      { numRuns: 100 },
    );
  });

  it("getBreakdownColor satisfies cycling: f(i) === f(i % length)", () => {
    fc.assert(
      fc.property(fc.nat(), (index) => {
        const direct = getBreakdownColor(index);
        const cycled = getBreakdownColor(index % BREAKDOWN_PALETTE.length);
        expect(direct).toBe(cycled);
      }),
      { numRuns: 100 },
    );
  });

  it("getCategoryColor returns a value from the correct category palette for any non-negative index", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CATEGORY_KEYS),
        fc.nat(),
        (category, index) => {
          const color = getCategoryColor(category, index);
          const palette = CATEGORY_PALETTES[category];
          expect(palette).toContain(color);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("getCategoryColor satisfies cycling: f(cat, i) === f(cat, i % palette.length)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CATEGORY_KEYS),
        fc.nat(),
        (category, index) => {
          const palette = CATEGORY_PALETTES[category];
          const direct = getCategoryColor(category, index);
          const cycled = getCategoryColor(category, index % palette.length);
          expect(direct).toBe(cycled);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: distribution-detail-modal, Property 5: Contraste de colores de la paleta contra fondo oscuro
describe("Property 5: Palette color contrast against dark background", () => {
  const MINIMUM_CONTRAST_RATIO = 3;

  it("every color in BREAKDOWN_PALETTE has at least 3:1 contrast ratio against COLORS.card", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: BREAKDOWN_PALETTE.length - 1 }),
        (index) => {
          const color = BREAKDOWN_PALETTE[index];
          const ratio = contrastRatio(color, COLORS.card);
          expect(ratio).toBeGreaterThanOrEqual(MINIMUM_CONTRAST_RATIO);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("every color across all category palettes has at least 3:1 contrast against COLORS.card", () => {
    for (const color of ALL_CATEGORY_COLORS) {
      const ratio = contrastRatio(color, COLORS.card);
      expect(ratio).toBeGreaterThanOrEqual(MINIMUM_CONTRAST_RATIO);
    }
  });

  it("validates contrast for each specific palette color", () => {
    for (const color of BREAKDOWN_PALETTE) {
      const ratio = contrastRatio(color, COLORS.card);
      expect(ratio).toBeGreaterThanOrEqual(MINIMUM_CONTRAST_RATIO);
    }
  });
});
