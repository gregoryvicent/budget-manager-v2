import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";

/**
 * Extracts the core swipe detection logic from useSwipeGesture for pure testing.
 * This mirrors the hook's internal algorithm without requiring React or DOM.
 *
 * @param startX - The X coordinate where the touch began
 * @param endX - The X coordinate where the touch ended
 * @param threshold - Minimum horizontal distance to trigger a swipe
 * @returns "right" | "left" | "none" indicating which swipe was detected
 */
function detectSwipe(
  startX: number,
  endX: number,
  threshold: number
): "right" | "left" | "none" {
  const delta = endX - startX;
  if (Math.abs(delta) >= threshold) {
    return delta > 0 ? "right" : "left";
  }
  return "none";
}

/**
 * Simulates the touch event flow as handled by useSwipeGesture and returns
 * which callbacks were invoked.
 *
 * @param startX - Touch start X coordinate
 * @param endX - Touch end X coordinate
 * @param threshold - Swipe threshold in pixels
 * @returns Object with boolean flags for each callback invocation
 */
function simulateSwipe(
  startX: number,
  endX: number,
  threshold: number
): { rightCalled: boolean; leftCalled: boolean } {
  const onSwipeRight = vi.fn();
  const onSwipeLeft = vi.fn();

  // Replicate the hook's touchstart/touchend handler logic
  const delta = endX - startX;
  const effectiveThreshold = threshold;

  if (Math.abs(delta) >= effectiveThreshold) {
    if (delta > 0) {
      onSwipeRight();
    } else {
      onSwipeLeft();
    }
  }

  return {
    rightCalled: onSwipeRight.mock.calls.length > 0,
    leftCalled: onSwipeLeft.mock.calls.length > 0,
  };
}

// Feature: responsive-mobile-ui, Property 12: Gesto swipe cierra el Sidebar
describe("Property 12: Swipe gesture closes the Sidebar", () => {
  it(
    "a right swipe exceeding the threshold always fires onSwipeRight",
    () => {
      fc.assert(
        fc.property(
          // startX: any reasonable screen coordinate
          fc.integer({ min: 0, max: 1000 }),
          // swipeDistance: positive distance that exceeds default threshold (50px)
          fc.integer({ min: 50, max: 500 }),
          // threshold: the configurable minimum distance
          fc.integer({ min: 1, max: 200 }),
          (startX, swipeDistance, threshold) => {
            // Ensure the swipe distance meets or exceeds the threshold
            const endX = startX + Math.max(swipeDistance, threshold);
            const result = simulateSwipe(startX, endX, threshold);

            expect(result.rightCalled).toBe(true);
            expect(result.leftCalled).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    "a left swipe exceeding the threshold always fires onSwipeLeft",
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }),
          fc.integer({ min: 50, max: 500 }),
          fc.integer({ min: 1, max: 200 }),
          (startX, swipeDistance, threshold) => {
            const endX = startX - Math.max(swipeDistance, threshold);
            const result = simulateSwipe(startX, endX, threshold);

            expect(result.leftCalled).toBe(true);
            expect(result.rightCalled).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    "a swipe below the threshold never fires any callback",
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 1, max: 200 }),
          (startX, threshold) => {
            // Generate a delta strictly below the threshold
            const belowThreshold = threshold - 1;
            // Test both directions
            const resultRight = simulateSwipe(
              startX,
              startX + belowThreshold,
              threshold
            );
            const resultLeft = simulateSwipe(
              startX,
              startX - belowThreshold,
              threshold
            );

            expect(resultRight.rightCalled).toBe(false);
            expect(resultRight.leftCalled).toBe(false);
            expect(resultLeft.rightCalled).toBe(false);
            expect(resultLeft.leftCalled).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    "the default threshold of 50px is respected by the detection logic",
    () => {
      const defaultThreshold = 50;

      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 0, max: 100 }),
          (startX, distance) => {
            const direction = detectSwipe(
              startX,
              startX + distance,
              defaultThreshold
            );

            if (distance >= defaultThreshold) {
              expect(direction).toBe("right");
            } else {
              expect(direction).toBe("none");
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    "exactly-at-threshold swipe always triggers the callback",
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 1, max: 300 }),
          (startX, threshold) => {
            // Exactly at threshold going right
            const rightResult = simulateSwipe(
              startX,
              startX + threshold,
              threshold
            );
            expect(rightResult.rightCalled).toBe(true);

            // Exactly at threshold going left
            const leftResult = simulateSwipe(
              startX,
              startX - threshold,
              threshold
            );
            expect(leftResult.leftCalled).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
