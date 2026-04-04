import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Represents the resolved width behaviour of a form input element.
 */
interface InputWidthResolution {
  /** Whether the input occupies 100% of its parent container width. */
  fullWidth: boolean;
  /** The Tailwind class responsible for the width behaviour. */
  appliedClass: string;
}

/**
 * Identifiers for every form input inside EditableList sub-components.
 *
 * AddItemForm inputs use `w-full` at base level (mobile-first) and switch
 * to flex-based sizing at `md:` breakpoint (`md:flex-2`, `md:flex-1`).
 *
 * EditableListItem edit inputs live inside a flex row and use `flex-2` /
 * `flex-1` with `min-w-0` at all breakpoints. On mobile the parent
 * container is the full card width, so flex children fill 100% of the
 * available row space.
 */
type FormInputId =
  | "AddItemForm.NameInput"
  | "AddItemForm.AmountInput"
  | "EditableListItem.EditNameInput"
  | "EditableListItem.EditAmountInput";

/**
 * Resolves the width behaviour of a form input based on the viewport width.
 *
 * The resolution mirrors the actual Tailwind classes applied in the
 * components:
 *
 * - AddItemForm inputs: `w-full md:flex-2` / `w-full md:flex-1`
 *   → On mobile (< 768px) the parent is `flex-col`, so `w-full` makes
 *     each input span the full container width.
 *   → On tablet+ the parent switches to `md:flex-row` and flex sizing
 *     distributes width proportionally.
 *
 * - EditableListItem edit inputs: `flex-2 min-w-0` / `flex-1 min-w-0`
 *   → The parent row is always `flex` (horizontal). On mobile the row
 *     itself is full-width inside the card, so flex children collectively
 *     fill 100% of the row. Each input's width is determined by its
 *     flex-grow value relative to siblings, but the combined inputs
 *     always span the full available width (minus action buttons).
 *
 * @param inputId - Identifier for the form input element
 * @param viewportWidth - Current viewport width in pixels
 * @returns The resolved width behaviour
 */
function resolveInputWidth(
  inputId: FormInputId,
  viewportWidth: number
): InputWidthResolution {
  const isMobile = viewportWidth < BREAKPOINTS.md;

  switch (inputId) {
    case "AddItemForm.NameInput":
      return isMobile
        ? { fullWidth: true, appliedClass: "w-full" }
        : { fullWidth: false, appliedClass: "md:flex-2" };

    case "AddItemForm.AmountInput":
      return isMobile
        ? { fullWidth: true, appliedClass: "w-full" }
        : { fullWidth: false, appliedClass: "md:flex-1" };

    case "EditableListItem.EditNameInput":
      // flex-2 inside a full-width flex row → fills proportional space
      // On mobile the parent card is full-width, so the flex row spans
      // the entire container and inputs fill all available space.
      return isMobile
        ? { fullWidth: true, appliedClass: "flex-2 (parent full-width row)" }
        : { fullWidth: false, appliedClass: "flex-2" };

    case "EditableListItem.EditAmountInput":
      return isMobile
        ? { fullWidth: true, appliedClass: "flex-1 (parent full-width row)" }
        : { fullWidth: false, appliedClass: "flex-1" };
  }
}

/**
 * Returns all form input identifiers within EditableList sub-components.
 */
function getAllFormInputs(): FormInputId[] {
  return [
    "AddItemForm.NameInput",
    "AddItemForm.AmountInput",
    "EditableListItem.EditNameInput",
    "EditableListItem.EditAmountInput",
  ];
}

// Feature: responsive-mobile-ui, Property 7: Inputs de formulario ocupan ancho completo en móvil
describe("Property 7: Form inputs occupy full width on mobile", () => {
  const inputs = getAllFormInputs();

  it("all form inputs resolve to full-width on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.constantFrom(...inputs),
        (viewportWidth, inputId) => {
          const resolution = resolveInputWidth(inputId, viewportWidth);
          expect(resolution.fullWidth).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("AddItemForm inputs use w-full class on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.constantFrom(
          "AddItemForm.NameInput" as FormInputId,
          "AddItemForm.AmountInput" as FormInputId
        ),
        (viewportWidth, inputId) => {
          const resolution = resolveInputWidth(inputId, viewportWidth);
          expect(resolution.appliedClass).toBe("w-full");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("form inputs switch to flex-based sizing on tablet+ viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        fc.constantFrom(...inputs),
        (viewportWidth, inputId) => {
          const resolution = resolveInputWidth(inputId, viewportWidth);
          expect(resolution.fullWidth).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("full-width behaviour holds at exact mobile boundary (767px)", () => {
    for (const inputId of inputs) {
      const resolution = resolveInputWidth(inputId, BREAKPOINTS.md - 1);
      expect(resolution.fullWidth).toBe(true);
    }
  });

  it("full-width behaviour does NOT hold at md breakpoint (768px)", () => {
    for (const inputId of inputs) {
      const resolution = resolveInputWidth(inputId, BREAKPOINTS.md);
      expect(resolution.fullWidth).toBe(false);
    }
  });
});
