import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { buildHistoryChartData } from "@/lib/buildHistoryChartData";
import type { MonthlySummary } from "@/lib/types/budgetHistory";

/**
 * Arbitrary that generates a valid MonthlySummary array:
 * - 0 to 12 elements
 * - Months 1-12 with no duplicates
 * - Non-negative amounts
 */
const monthlySummariesArb = fc
  .shuffledSubarray(
    Array.from({ length: 12 }, (_, i) => i + 1),
    { minLength: 0, maxLength: 12 },
  )
  .chain((months) =>
    fc
      .tuple(
        ...months.map((month) =>
          fc
            .record({
              totalIncome: fc.double({ min: 0, max: 1_000_000, noNaN: true }),
              totalExpenses: fc.double({ min: 0, max: 1_000_000, noNaN: true }),
            })
            .map(
              ({ totalIncome, totalExpenses }): MonthlySummary => ({
                year: 2025,
                month,
                totalIncome,
                totalExpenses,
              }),
            ),
        ),
      )
      .map((summaries) => summaries as MonthlySummary[]),
  );

const yearArb = fc.integer({ min: 2000, max: 2100 });

// Feature: budget-history-chart, Property 1: Invariante de estructura — siempre 12 entradas ordenadas cronológicamente
describe("Property 1: Structural invariant — always 12 chronologically ordered entries", () => {
  it("output always has exactly 12 entries", () => {
    fc.assert(
      fc.property(monthlySummariesArb, yearArb, (summaries, year) => {
        const result = buildHistoryChartData(summaries, year);
        expect(result).toHaveLength(12);
      }),
      { numRuns: 100 },
    );
  });

  it("entries have months 1 through 12 in order", () => {
    fc.assert(
      fc.property(monthlySummariesArb, yearArb, (summaries, year) => {
        const result = buildHistoryChartData(summaries, year);
        const months = result.map((e) => e.month);
        expect(months).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      }),
      { numRuns: 100 },
    );
  });

  it("month labels match the expected Spanish abbreviations in order", () => {
    const expectedLabels = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];

    fc.assert(
      fc.property(monthlySummariesArb, yearArb, (summaries, year) => {
        const result = buildHistoryChartData(summaries, year);
        const labels = result.map((e) => e.monthLabel);
        expect(labels).toEqual(expectedLabels);
      }),
      { numRuns: 100 },
    );
  });

  it("income and expenses are non-negative for all entries", () => {
    fc.assert(
      fc.property(monthlySummariesArb, yearArb, (summaries, year) => {
        const result = buildHistoryChartData(summaries, year);
        for (const entry of result) {
          expect(entry.income).toBeGreaterThanOrEqual(0);
          expect(entry.expenses).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: budget-history-chart, Property 2: Conservación de sumas — ingresos y gastos totales se preservan
describe("Property 2: Sum conservation — total income and expenses are preserved", () => {
  it("sum of output income equals sum of input totalIncome", () => {
    fc.assert(
      fc.property(monthlySummariesArb, yearArb, (summaries, year) => {
        const result = buildHistoryChartData(summaries, year);
        const inputTotal = summaries.reduce((acc, s) => acc + s.totalIncome, 0);
        const outputTotal = result.reduce((acc, e) => acc + e.income, 0);
        expect(outputTotal).toBeCloseTo(inputTotal, 5);
      }),
      { numRuns: 100 },
    );
  });

  it("sum of output expenses equals sum of input totalExpenses", () => {
    fc.assert(
      fc.property(monthlySummariesArb, yearArb, (summaries, year) => {
        const result = buildHistoryChartData(summaries, year);
        const inputTotal = summaries.reduce((acc, s) => acc + s.totalExpenses, 0);
        const outputTotal = result.reduce((acc, e) => acc + e.expenses, 0);
        expect(outputTotal).toBeCloseTo(inputTotal, 5);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: budget-history-chart, Property 3: Round-trip — los meses con datos preservan sus valores exactos
describe("Property 3: Round-trip — months with data preserve their exact values", () => {
  it("each input month's totalIncome appears as income in the corresponding output entry", () => {
    fc.assert(
      fc.property(monthlySummariesArb, yearArb, (summaries, year) => {
        const result = buildHistoryChartData(summaries, year);
        for (const s of summaries) {
          const entry = result.find((e) => e.month === s.month);
          expect(entry).toBeDefined();
          expect(entry!.income).toBe(s.totalIncome);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("each input month's totalExpenses appears as expenses in the corresponding output entry", () => {
    fc.assert(
      fc.property(monthlySummariesArb, yearArb, (summaries, year) => {
        const result = buildHistoryChartData(summaries, year);
        for (const s of summaries) {
          const entry = result.find((e) => e.month === s.month);
          expect(entry).toBeDefined();
          expect(entry!.expenses).toBe(s.totalExpenses);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: budget-history-chart, Property 4: Relleno con ceros — meses sin datos tienen valores cero
describe("Property 4: Zero fill — months without data have zero values", () => {
  it("months absent from input have income === 0 and expenses === 0", () => {
    fc.assert(
      fc.property(monthlySummariesArb, yearArb, (summaries, year) => {
        const result = buildHistoryChartData(summaries, year);
        const inputMonths = new Set(summaries.map((s) => s.month));

        for (const entry of result) {
          if (!inputMonths.has(entry.month)) {
            expect(entry.income).toBe(0);
            expect(entry.expenses).toBe(0);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
