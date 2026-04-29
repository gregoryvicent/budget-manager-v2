import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Linearizes a single sRGB channel value (0–255) to its linear-light
 * equivalent, per the sRGB transfer function defined in WCAG 2.1.
 *
 * @param channel - Integer 0–255 representing an sRGB color channel
 * @returns Linear-light value in the range [0, 1]
 */
function linearize(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Computes the WCAG 2.1 relative luminance for an sRGB color.
 *
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where R, G, B are linearized sRGB channel values.
 *
 * @param hex - 6-digit hex color string (e.g. "#f9fafb")
 * @returns Relative luminance in the range [0, 1]
 */
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Calculates the WCAG 2.1 contrast ratio between two colors.
 *
 * Contrast ratio = (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the relative luminance of the lighter color and
 * L2 is the relative luminance of the darker color.
 *
 * @param hex1 - First color as a 6-digit hex string
 * @param hex2 - Second color as a 6-digit hex string
 * @returns Contrast ratio (always >= 1)
 */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Text size classification for WCAG thresholds. */
type TextSize = "normal" | "large";

/**
 * Represents a text/background color pair used in the landing page,
 * along with its usage context and applicable WCAG threshold.
 */
interface ColorPair {
  /** Human-readable description of where this pair is used. */
  usage: string;
  /** Hex color of the text. */
  textColor: string;
  /** Hex color of the background. */
  bgColor: string;
  /** Whether the text is "normal" or "large" per WCAG definitions. */
  textSize: TextSize;
}

/** WCAG AA minimum contrast ratio for normal text (< 18pt or < 14pt bold). */
const WCAG_AA_NORMAL = 4.5;

/** WCAG AA minimum contrast ratio for large text (>= 18pt or >= 14pt bold). */
const WCAG_AA_LARGE = 3.0;

/**
 * All text/background color pairs used in the landing page (app/page.tsx),
 * derived from the design document's color palette and component classes.
 *
 * Color values come from globals.css @theme tokens:
 * - text: #f9fafb
 * - text-dim: #cbd5e1
 * - muted: #9ca3af
 * - bg: #0a0f1e
 * - card: #111827
 * - savings: #3b82f6
 * - white on buttons: #ffffff
 */
const COLOR_PAIRS: ColorPair[] = [
  {
    usage: "Main headings (h1, h2) on page background",
    textColor: "#f9fafb",
    bgColor: "#0a0f1e",
    textSize: "large",
  },
  {
    usage: "Descriptions and nav links on page background",
    textColor: "#cbd5e1",
    bgColor: "#0a0f1e",
    textSize: "normal",
  },
  {
    usage: "Footer copyright (muted) on page background",
    textColor: "#9ca3af",
    bgColor: "#0a0f1e",
    textSize: "normal",
  },
  {
    usage: "Primary CTA button text (white on blue-600)",
    textColor: "#ffffff",
    bgColor: "#2563eb",
    textSize: "normal",
  },
  {
    usage: "Secondary CTA text (savings blue on page background)",
    textColor: "#3b82f6",
    bgColor: "#0a0f1e",
    textSize: "normal",
  },
  {
    usage: "Feature card titles on card background",
    textColor: "#f9fafb",
    bgColor: "#111827",
    textSize: "normal",
  },
  {
    usage: "Feature card descriptions on card background",
    textColor: "#cbd5e1",
    bgColor: "#111827",
    textSize: "normal",
  },
];

/**
 * Returns the minimum WCAG AA contrast ratio for the given text size.
 *
 * @param size - "normal" or "large" text classification
 * @returns 4.5 for normal text, 3.0 for large text
 */
function getMinimumRatio(size: TextSize): number {
  return size === "large" ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
}

// Feature: landing-page, Property 6: Contraste de color cumple WCAG AA
describe("Property 6: Color contrast meets WCAG AA (4.5:1 minimum)", () => {
  /**
   * **Validates: Requirements 8.4**
   *
   * Requirement 8.4: THE Landing_Page SHALL ensure sufficient color contrast
   * between text and background colors (minimum 4.5:1 ratio for normal text
   * per WCAG 2.1 AA).
   */

  it("all landing page color pairs meet their WCAG AA contrast threshold", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...COLOR_PAIRS),
        (pair) => {
          const ratio = contrastRatio(pair.textColor, pair.bgColor);
          const minimum = getMinimumRatio(pair.textSize);
          expect(ratio).toBeGreaterThanOrEqual(minimum);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("no color pair falls below the absolute minimum of 3:1", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...COLOR_PAIRS),
        (pair) => {
          const ratio = contrastRatio(pair.textColor, pair.bgColor);
          expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("normal-text pairs meet the stricter 4.5:1 threshold", () => {
    const normalPairs = COLOR_PAIRS.filter((p) => p.textSize === "normal");

    fc.assert(
      fc.property(
        fc.constantFrom(...normalPairs),
        (pair) => {
          const ratio = contrastRatio(pair.textColor, pair.bgColor);
          expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
        }
      ),
      { numRuns: 100 }
    );
  });
});
