/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fc from "fast-check";
import ExpandedListModal from "../index";
import { formatCurrency } from "@/lib/theme";
import type { ListItem } from "@/lib/types";

afterEach(() => {
  cleanup();
});

/**
 * Arbitrary generator for ListItem with constrained float amounts.
 */
const listItemArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  amount: fc.float({ min: 0, max: 999999, noNaN: true }),
});

const itemsArb = fc.array(listItemArb, { minLength: 0, maxLength: 20 });

/**
 * Default props required to render ExpandedListModal.
 */
const defaultProps = {
  open: true,
  onClose: vi.fn(),
  title: "Test Category",
  color: "#10b981",
  icon: () => null,
  onAdd: vi.fn().mockResolvedValue(undefined),
  onUpdate: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
};

// Feature: expanded-list-view, Property 1: Total = suma de montos
describe("Property 1: The displayed total equals the sum of all item amounts", () => {
  /**
   * Validates: Requirements 5.1
   *
   * For any list of ListItem[] with arbitrary amounts, the rendered total
   * must equal formatCurrency(sum(items.map(i => i.amount))).
   */
  it("rendered total matches formatCurrency of the sum of all item amounts", () => {
    fc.assert(
      fc.property(itemsArb, (items: ListItem[]) => {
        cleanup();

        render(<ExpandedListModal {...defaultProps} items={items} />);

        const expectedTotal = formatCurrency(
          items.reduce((s, i) => s + i.amount, 0),
        );

        // Find the "Total" label, then check its sibling span for the value
        const totalLabel = screen.getByText("Total");
        const totalContainer = totalLabel.parentElement!;
        const totalValue = totalContainer.querySelector("span:last-child")!;
        expect(totalValue.textContent).toBe(expectedTotal);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Generator for strings safe to use with userEvent.type().
 * Uses alphanumeric characters to avoid userEvent special modifier chars.
 */
const safeChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
const safeStringArb = (opts: { minLength: number; maxLength: number }) =>
  fc
    .array(fc.constantFrom(...safeChars), opts)
    .map((chars) => chars.join(""));

/**
 * Helper: set an input value using native setter + input event.
 * Faster than userEvent.type for property tests while still triggering React state updates.
 */
function setInputValue(input: HTMLInputElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  nativeInputValueSetter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

// Feature: expanded-list-view, Property 2: Faithful delegation of CRUD operations
describe("Property 2: Faithful delegation of CRUD operations", () => {
  /**
   * Validates: Requirements 2.2, 2.3, 2.4
   *
   * For any CRUD operation (add with name/amount, edit with id/name/amount,
   * delete with id), the ExpandedListModal must invoke the corresponding
   * callback with exactly the same arguments.
   */

  it("onDelete is called with the correct item id", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.float({ min: 0, max: 999999, noNaN: true }),
        async (id: string, amount: number) => {
          cleanup();
          const onDelete = vi.fn().mockResolvedValue(undefined);
          const item: ListItem = { id, name: `Item-${id.slice(0, 8)}`, amount };

          render(
            <ExpandedListModal
              {...defaultProps}
              items={[item]}
              onDelete={onDelete}
            />,
          );

          const user = userEvent.setup();

          // Find the item row, then locate the delete button (last button)
          const itemNameEl = screen.getByText(item.name);
          const itemRow = itemNameEl.closest(
            "div.flex.items-center",
          ) as HTMLElement;
          const buttons = within(itemRow).getAllByRole("button");
          const deleteButton = buttons[buttons.length - 1];

          await user.click(deleteButton);

          expect(onDelete).toHaveBeenCalledWith(item.id);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("onAdd is called with the correct name and parsed amount", async () => {
    await fc.assert(
      fc.asyncProperty(
        safeStringArb({ minLength: 1, maxLength: 20 }),
        fc.float({ min: Math.fround(0.01), max: 999999, noNaN: true }),
        async (name: string, amount: number) => {
          cleanup();
          const onAdd = vi.fn().mockResolvedValue(undefined);

          render(
            <ExpandedListModal
              {...defaultProps}
              items={[]}
              onAdd={onAdd}
            />,
          );

          const user = userEvent.setup();

          // Click "Añadir" to show the add form
          const addButton = screen.getByText("Añadir");
          await user.click(addButton);

          // Set input values directly for performance in property tests
          const nameInput = screen.getByPlaceholderText("Nombre") as HTMLInputElement;
          const amountInput = screen.getByPlaceholderText("Monto") as HTMLInputElement;

          act(() => {
            setInputValue(nameInput, name);
            const amountStr = String(amount);
            setInputValue(amountInput, amountStr);
          });

          // Click OK to submit
          const okButton = screen.getByText("OK");
          await user.click(okButton);

          const amountStr = String(amount);
          expect(onAdd).toHaveBeenCalledOnce();
          expect(onAdd).toHaveBeenCalledWith(name, parseFloat(amountStr));
        },
      ),
      { numRuns: 100 },
    );
  });

  it("onUpdate is called with the correct id, trimmed name, and parsed amount", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.float({ min: Math.fround(0.01), max: 999999, noNaN: true }),
        safeStringArb({ minLength: 1, maxLength: 20 }),
        fc.float({ min: Math.fround(0.01), max: 999999, noNaN: true }),
        async (id: string, origAmount: number, newName: string, newAmount: number) => {
          cleanup();
          const onUpdate = vi.fn().mockResolvedValue(undefined);
          const item: ListItem = { id, name: `Item-${id.slice(0, 8)}`, amount: origAmount };

          render(
            <ExpandedListModal
              {...defaultProps}
              items={[item]}
              onUpdate={onUpdate}
            />,
          );

          const user = userEvent.setup();

          // Click on item name to start editing
          const itemNameEl = screen.getByText(item.name);
          await user.click(itemNameEl);

          // Set new values directly for performance in property tests
          const nameInput = screen.getAllByRole("textbox")[0] as HTMLInputElement;
          const amountInput = screen.getByRole("spinbutton") as HTMLInputElement;

          const newAmountStr = String(newAmount);
          act(() => {
            setInputValue(nameInput, newName);
            setInputValue(amountInput, newAmountStr);
          });

          // Click the confirm (Check) button — first button in the edit row
          const editRow = nameInput.closest(
            "div.flex.items-center",
          ) as HTMLElement;
          const editButtons = within(editRow).getAllByRole("button");
          await user.click(editButtons[0]);

          expect(onUpdate).toHaveBeenCalledOnce();
          expect(onUpdate).toHaveBeenCalledWith(
            item.id,
            newName.trim(),
            parseFloat(newAmountStr),
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});


// Feature: expanded-list-view, Property 3: Título y color de categoría
describe("Property 3: The category title and color render correctly", () => {
  /**
   * Validates: Requirements 1.3
   *
   * For any combination of title (non-empty string) and color (hex string),
   * the title must be present in the DOM and the color in the styles.
   */
  it("renders the category title in the heading and applies the color to the total value", () => {
    // Generate titles that contain at least one visible (non-whitespace) character
    const titleArb = fc
      .string({ minLength: 1 })
      .filter((s) => s.trim().length > 0);
    const hexChars = "0123456789abcdef".split("");
    const colorArb = fc
      .array(fc.constantFrom(...hexChars), { minLength: 6, maxLength: 6 })
      .map((chars) => "#" + chars.join(""));

    fc.assert(
      fc.property(titleArb, colorArb, (title: string, color: string) => {
        cleanup();

        render(
          <ExpandedListModal
            {...defaultProps}
            title={title}
            color={color}
            items={[]}
          />,
        );

        // The Modal renders the title in an <h2> heading
        const heading = screen.getByRole("heading");
        expect(heading.textContent).toBe(title);

        // The total value span uses style={{ color }} directly.
        // jsdom normalizes hex colors to rgb(), so we convert hex to rgb for comparison.
        const totalLabel = screen.getByText("Total");
        const totalContainer = totalLabel.parentElement!;
        const totalValue = totalContainer.querySelector("span:last-child") as HTMLElement;

        // Convert hex color to rgb string for comparison with jsdom output
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const expectedRgb = `rgb(${r}, ${g}, ${b})`;

        expect(totalValue.style.color).toBe(expectedRgb);
      }),
      { numRuns: 100 },
    );
  });
});
