/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DistributionChart from "../index";
import type { PieDataItem } from "../types/PieDataItem";
import type { BreakdownData } from "../types/BreakdownData";

// Mock Recharts to avoid canvas rendering in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  Tooltip: () => <div />,
}));

// Mock DetailModal to verify it receives correct props
const mockDetailModal = vi.fn(() => null);
vi.mock("@/components/DetailModal", () => ({
  default: (props: Record<string, unknown>) => {
    mockDetailModal(props);
    if (!props.open) return null;
    return <div data-testid="detail-modal" role="dialog">Modal Content</div>;
  },
}));

// Mock useMediaQuery
vi.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: () => false,
}));

const sampleData: PieDataItem[] = [
  { name: "Gastos Fijos", value: 1000, color: "#60a5fa" },
  { name: "Gastos Variables", value: 500, color: "#f472b6" },
  { name: "Ahorros", value: 300, color: "#34d399" },
];

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
    items: [],
    referenceTotal: 0,
    emptyMessage: "Sin metas de ahorro asignadas",
  },
  investments: {
    title: "Inversiones",
    items: [],
    referenceTotal: 0,
    emptyMessage: "Sin metas de inversión asignadas",
  },
});

describe("DistributionChart — 'Más detalles' button", () => {
  afterEach(() => {
    cleanup();
    mockDetailModal.mockClear();
  });

  // Req 1.1: Renders "Más detalles" button when breakdownData is provided
  it("renders the 'Más detalles' button when breakdownData is provided", () => {
    render(
      <DistributionChart
        data={sampleData}
        totalIncome={3000}
        breakdownData={makeBreakdownData()}
      />,
    );

    const button = screen.getByRole("button", { name: "Más detalles" });
    expect(button).toBeTruthy();
  });

  // Req 1.1 (retrocompatibility): Does not render button without breakdownData
  it("does not render the button when breakdownData is not provided", () => {
    render(<DistributionChart data={sampleData} totalIncome={3000} />);

    expect(screen.queryByRole("button", { name: "Más detalles" })).toBeNull();
  });

  // Req 1.3: Button is disabled when data array is empty
  it("disables the button when data is empty", () => {
    render(
      <DistributionChart
        data={[]}
        totalIncome={0}
        breakdownData={makeBreakdownData()}
      />,
    );

    const button = screen.getByRole("button", { name: "Más detalles" });
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  // Req 1.3 (inverse): Button is enabled when data has items
  it("enables the button when data has items", () => {
    render(
      <DistributionChart
        data={sampleData}
        totalIncome={3000}
        breakdownData={makeBreakdownData()}
      />,
    );

    const button = screen.getByRole("button", { name: "Más detalles" });
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  // Req 1.2: Clicking the button opens the DetailModal
  it("opens the DetailModal when the button is clicked", () => {
    render(
      <DistributionChart
        data={sampleData}
        totalIncome={3000}
        breakdownData={makeBreakdownData()}
      />,
    );

    // Modal should initially be closed
    expect(screen.queryByTestId("detail-modal")).toBeNull();

    const button = screen.getByRole("button", { name: "Más detalles" });
    fireEvent.click(button);

    // Modal should now be open
    expect(screen.getByTestId("detail-modal")).toBeTruthy();
  });

  // Req 1.2: DetailModal receives breakdownData
  it("passes breakdownData to DetailModal", () => {
    const breakdownData = makeBreakdownData();
    render(
      <DistributionChart
        data={sampleData}
        totalIncome={3000}
        breakdownData={breakdownData}
      />,
    );

    expect(mockDetailModal).toHaveBeenCalled();
    const lastCall = mockDetailModal.mock.calls[mockDetailModal.mock.calls.length - 1][0] as Record<string, unknown>;
    expect(lastCall.breakdownData).toEqual(breakdownData);
  });

  // Req 1.3: Clicking disabled button does not open modal
  it("does not open the modal when clicking a disabled button", () => {
    render(
      <DistributionChart
        data={[]}
        totalIncome={0}
        breakdownData={makeBreakdownData()}
      />,
    );

    const button = screen.getByRole("button", { name: "Más detalles" });
    fireEvent.click(button);

    // Modal should remain closed
    expect(screen.queryByTestId("detail-modal")).toBeNull();
  });
});
