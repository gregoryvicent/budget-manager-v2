/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import fc from "fast-check";
import { Alert } from "../index";
import type { AlertVariant } from "@/contexts/AlertContext";
import { AlertProvider, AlertContext } from "@/contexts/AlertContext";
import React, { useContext } from "react";

// Suppress requestAnimationFrame in test environment
beforeEach(() => {
  vi.useFakeTimers();
  // Provide a minimal requestAnimationFrame for the entry animation
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/**
 * Arbitrary for alert variant types.
 */
const variantArb: fc.Arbitrary<AlertVariant> = fc.constantFrom(
  "success",
  "error",
  "warning",
);

/**
 * Expected icon label text per variant (from lucide-react SVG title or accessible name).
 * We check for the presence of the correct SVG class names instead.
 */
const VARIANT_COLORS: Record<AlertVariant, string> = {
  success: "text-[#10b981]",
  error: "text-[#ef4444]",
  warning: "text-[#f59e0b]",
};

const VARIANT_BG: Record<AlertVariant, string> = {
  success: "bg-[#10b981]/10",
  error: "bg-[#ef4444]/10",
  warning: "bg-[#f59e0b]/10",
};

const VARIANT_BORDER: Record<AlertVariant, string> = {
  success: "border-[#10b981]",
  error: "border-[#ef4444]",
  warning: "border-[#f59e0b]",
};

// Feature: idempotent-operations, Property 8: Renderizado correcto de variantes del Alert
describe("Property 8: Alert variant rendering — correct icon and color scheme", () => {
  it("renders the correct color scheme for any variant", () => {
    fc.assert(
      fc.property(variantArb, (variant) => {
        cleanup();
        const onDismiss = vi.fn();

        const { container } = render(
          <Alert
            id="test-alert"
            variant={variant}
            message="Test message"
            durationMs={0}
            onDismiss={onDismiss}
          />,
        );

        const alertEl = screen.getByRole("alert");

        // Verify background color class
        expect(alertEl.className).toContain(VARIANT_BG[variant]);
        // Verify border color class
        expect(alertEl.className).toContain(VARIANT_BORDER[variant]);

        // Verify icon has the correct text color class
        const svgIcon = container.querySelector("svg");
        expect(svgIcon).not.toBeNull();
        expect(svgIcon!.className.baseVal || svgIcon!.getAttribute("class") || "").toContain(
          VARIANT_COLORS[variant],
        );
      }),
      { numRuns: 100 },
    );
  });

  it("renders the message text for any variant and message combination", () => {
    // Use alphanumeric strings to avoid whitespace-only edge cases with getByText
    const messageArb = fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(
      (s) => s.trim().length > 0,
    );

    fc.assert(
      fc.property(variantArb, messageArb, (variant, message) => {
        cleanup();

        render(
          <Alert
            id="test-alert"
            variant={variant}
            message={message}
            durationMs={0}
            onDismiss={vi.fn()}
          />,
        );

        // Verify the message appears in the alert element
        const alertEl = screen.getByRole("alert");
        expect(alertEl.textContent).toContain(message);
      }),
      { numRuns: 100 },
    );
  });

  it("always renders a close button for any variant", () => {
    fc.assert(
      fc.property(variantArb, (variant) => {
        cleanup();

        render(
          <Alert
            id="test-alert"
            variant={variant}
            message="Test"
            durationMs={0}
            onDismiss={vi.fn()}
          />,
        );

        expect(screen.getByLabelText("Cerrar alerta")).toBeTruthy();
      }),
      { numRuns: 100 },
    );
  });
});


// Feature: idempotent-operations, Property 9: Auto-dismiss del Alert tras duración configurable
describe("Property 9: Auto-dismiss — onDismiss called after durationMs", () => {
  it("calls onDismiss after the specified durationMs for any positive duration", () => {
    // Use a smaller range to keep test execution fast with fake timers
    const durationArb = fc.integer({ min: 100, max: 10000 });

    fc.assert(
      fc.property(durationArb, (durationMs) => {
        cleanup();
        const onDismiss = vi.fn();

        render(
          <Alert
            id="test-alert"
            variant="success"
            message="Test"
            durationMs={durationMs}
            onDismiss={onDismiss}
          />,
        );

        // Before the duration elapses, onDismiss should not be called
        act(() => {
          vi.advanceTimersByTime(durationMs - 1);
        });
        expect(onDismiss).not.toHaveBeenCalled();

        // After the duration elapses, the exit animation starts (200ms setTimeout)
        act(() => {
          vi.advanceTimersByTime(1);
        });

        // The component sets exiting=true and schedules onDismiss after 200ms
        act(() => {
          vi.advanceTimersByTime(200);
        });

        expect(onDismiss).toHaveBeenCalledWith("test-alert");
        expect(onDismiss).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 },
    );
  });

  it("uses default 4000ms when durationMs is not provided", () => {
    cleanup();
    const onDismiss = vi.fn();

    render(
      <Alert
        id="default-duration"
        variant="error"
        message="Default timing"
        onDismiss={onDismiss}
      />,
    );

    // Should not dismiss before 4000ms
    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    // Should dismiss at 4000ms + 200ms exit animation
    act(() => {
      vi.advanceTimersByTime(1);
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onDismiss).toHaveBeenCalledWith("default-duration");
  });
});

// Feature: idempotent-operations, Property 10: Apilamiento cronológico de alertas
describe("Property 10: Chronological alert stacking — N alerts rendered in order", () => {
  /**
   * Helper component that adds alerts to the context on mount.
   */
  function AlertAdder({ alerts }: { alerts: Array<{ variant: AlertVariant; message: string }> }) {
    const ctx = useContext(AlertContext);
    const addedRef = React.useRef(false);

    React.useEffect(() => {
      if (ctx && !addedRef.current) {
        addedRef.current = true;
        for (const alert of alerts) {
          ctx.addAlert({ variant: alert.variant, message: alert.message });
        }
      }
    }, [ctx, alerts]);

    return null;
  }

  it("renders exactly N alerts in chronological order for any list of N alerts", () => {
    const alertItemArb = fc.record({
      variant: variantArb,
      message: fc.string({ minLength: 1, maxLength: 50 }).map(
        (s, i) => `alert-msg-${i ?? 0}-${s.replace(/[<>"'/]/g, "x")}`,
      ),
    });

    const alertListArb = fc.array(alertItemArb, { minLength: 1, maxLength: 10 });

    fc.assert(
      fc.property(alertListArb, (alertItems) => {
        cleanup();

        // Provide a stable crypto.randomUUID for the provider
        let counter = 0;
        vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
          counter++;
          return `00000000-0000-4000-8000-${String(counter).padStart(12, "0")}`;
        });

        render(
          <AlertProvider>
            <AlertAdder alerts={alertItems} />
          </AlertProvider>,
        );

        const alertElements = screen.getAllByRole("alert");

        // Exactly N alerts rendered
        expect(alertElements.length).toBe(alertItems.length);

        // Each alert message appears in chronological order
        for (let i = 0; i < alertItems.length; i++) {
          expect(alertElements[i].textContent).toContain(alertItems[i].message);
        }

        // Restore
        vi.mocked(crypto.randomUUID).mockRestore();
      }),
      { numRuns: 100 },
    );
  });
});
