/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import fc from "fast-check";
import EditableList from "../index";

afterEach(() => {
  cleanup();
});

/**
 * Default props required to render EditableList.
 */
const defaultProps = {
  items: [],
  color: "#10b981",
  icon: () => null,
  onAdd: vi.fn().mockResolvedValue(undefined),
  onUpdate: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
  onExpand: vi.fn(),
};

// Feature: expanded-list-view, Property 4: aria-label del botón de expansión
describe("Property 4: The expand button's aria-label contains the category title", () => {
  /**
   * Validates: Requirements 8.2
   *
   * For any category title, the expand button must have an aria-label
   * that contains that title string.
   */
  it("expand button aria-label contains the category title for any non-empty title", () => {
    // Generate titles with at least one visible (non-whitespace) character
    const titleArb = fc
      .string({ minLength: 1 })
      .filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(titleArb, (title: string) => {
        cleanup();

        render(<EditableList {...defaultProps} title={title} />);

        // Find all buttons and locate the one with an aria-label containing the title
        const buttons = screen.getAllByRole("button");
        const expandButton = buttons.find((btn) =>
          btn.getAttribute("aria-label")?.includes(title),
        );

        expect(expandButton).toBeDefined();
        expect(expandButton!.getAttribute("aria-label")).toContain(title);
      }),
      { numRuns: 100 },
    );
  });
});
