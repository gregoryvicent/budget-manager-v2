/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import DetailModal from "../index";
import type { BreakdownData } from "@/components/DistributionChart/types/BreakdownData";

// Mock BreakdownDonut to avoid Recharts rendering in jsdom
vi.mock("@/components/BreakdownDonut", () => ({
  default: ({ title, emptyMessage, items }: { title: string; emptyMessage: string; items: { name: string }[] }) => (
    <div data-testid={`donut-${title}`}>
      <span>{title}</span>
      {items.length === 0 && <span>{emptyMessage}</span>}
    </div>
  ),
}));

// Mock useMediaQuery (used by BreakdownDonut internally)
vi.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: () => true,
}));

const makeBreakdownData = (): BreakdownData => ({
  incomes: {
    title: "Ingresos",
    items: [{ name: "Salary", value: 3000, color: "#34d399" }],
    referenceTotal: 3000,
    emptyMessage: "Sin ingresos",
  },
  expenses: {
    title: "Gastos",
    items: [{ name: "Rent", value: 1000, color: "#fb923c" }, { name: "Food", value: 500, color: "#f87171" }],
    referenceTotal: 1500,
    emptyMessage: "Sin gastos",
  },
  savings: {
    title: "Ahorros",
    items: [{ name: "Emergency", value: 300, color: "#60a5fa" }],
    referenceTotal: 300,
    emptyMessage: "Sin metas de ahorro asignadas",
  },
  investments: {
    title: "Inversiones",
    items: [],
    referenceTotal: 0,
    emptyMessage: "Sin metas de inversión asignadas",
  },
});

describe("DetailModal component", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  // Req 8.4: Modal title
  it("renders the modal with correct title when open", () => {
    render(
      <DetailModal open={true} onClose={() => {}} breakdownData={makeBreakdownData()} />,
    );
    expect(screen.getByText("Desglose de Distribución")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(
      <DetailModal open={false} onClose={() => {}} breakdownData={makeBreakdownData()} />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // Req 8.1, 8.2: Renders a BreakdownDonut for each category
  it("renders all four category donuts", () => {
    render(
      <DetailModal open={true} onClose={() => {}} breakdownData={makeBreakdownData()} />,
    );
    expect(screen.getByTestId("donut-Ingresos")).toBeTruthy();
    expect(screen.getByTestId("donut-Gastos")).toBeTruthy();
    expect(screen.getByTestId("donut-Ahorros")).toBeTruthy();
    expect(screen.getByTestId("donut-Inversiones")).toBeTruthy();
  });

  // Req 8.1: Vertical stacked layout
  it("uses vertical flex layout for categories", () => {
    const { container } = render(
      <DetailModal open={true} onClose={() => {}} breakdownData={makeBreakdownData()} />,
    );
    const stack = container.querySelector("[style*='flex-direction: column']") as HTMLElement;
    expect(stack).toBeTruthy();
  });

  // Req 8.4: Max width constraint
  it("constrains modal width to 720px", () => {
    const { container } = render(
      <DetailModal open={true} onClose={() => {}} breakdownData={makeBreakdownData()} />,
    );
    const modalContent = container.querySelector("[style*='max-width: 720px']") as HTMLElement;
    expect(modalContent).toBeTruthy();
  });

  // Empty category shows empty message via BreakdownDonut
  it("passes empty items to BreakdownDonut for empty categories", () => {
    render(
      <DetailModal open={true} onClose={() => {}} breakdownData={makeBreakdownData()} />,
    );
    expect(screen.getByText("Sin metas de inversión asignadas")).toBeTruthy();
  });
});
