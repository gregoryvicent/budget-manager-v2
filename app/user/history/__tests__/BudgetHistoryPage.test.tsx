/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

// Mock useBudgetHistory hook
const mockRetry = vi.fn();
const mockUseBudgetHistory = vi.fn();
vi.mock("@/hooks/useBudgetHistory", () => ({
  useBudgetHistory: (...args: unknown[]) => mockUseBudgetHistory(...args),
}));

// Mock HistoryBarChart to avoid Recharts rendering in jsdom
vi.mock("@/components/HistoryBarChart", () => ({
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="history-bar-chart">{data.length} entries</div>
  ),
}));

// Mock YearFilter to capture props
vi.mock("@/components/YearFilter", () => ({
  default: ({
    selectedYear,
    availableYears,
    onChange,
  }: {
    selectedYear: number;
    availableYears: number[];
    onChange: (y: number) => void;
  }) => (
    <div data-testid="year-filter">
      <span data-testid="selected-year">{selectedYear}</span>
      {availableYears.map((y) => (
        <button key={y} data-testid={`year-${y}`} onClick={() => onChange(y)}>
          {y}
        </button>
      ))}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  BarChart3: () => <span data-testid="icon-bar-chart" />,
}));

// Mock HistoryPageSkeleton
vi.mock("@/components/HistoryPageSkeleton", () => ({
  default: () => <div data-testid="history-page-skeleton" />,
}));

import BudgetHistoryPage from "../page";

/** Helper: chart data with some non-zero values */
const chartDataWithValues = [
  { month: 1, monthLabel: "Ene", income: 5000, expenses: 3000 },
  { month: 2, monthLabel: "Feb", income: 0, expenses: 0 },
  { month: 3, monthLabel: "Mar", income: 4000, expenses: 2500 },
  { month: 4, monthLabel: "Abr", income: 0, expenses: 0 },
  { month: 5, monthLabel: "May", income: 0, expenses: 0 },
  { month: 6, monthLabel: "Jun", income: 0, expenses: 0 },
  { month: 7, monthLabel: "Jul", income: 0, expenses: 0 },
  { month: 8, monthLabel: "Ago", income: 0, expenses: 0 },
  { month: 9, monthLabel: "Sep", income: 0, expenses: 0 },
  { month: 10, monthLabel: "Oct", income: 0, expenses: 0 },
  { month: 11, monthLabel: "Nov", income: 0, expenses: 0 },
  { month: 12, monthLabel: "Dic", income: 0, expenses: 0 },
];

/** Helper: chart data with all zeros */
const emptyChartData = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  monthLabel: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
  income: 0,
  expenses: 0,
}));

describe("BudgetHistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Req 3.1: Year filter starts with the current year
  it("initializes the year filter with the current year", () => {
    const currentYear = new Date().getFullYear();
    mockUseBudgetHistory.mockReturnValue({
      chartData: chartDataWithValues,
      availableYears: [2025, 2024],
      loading: false,
      error: null,
      retry: mockRetry,
    });

    render(<BudgetHistoryPage />);

    expect(screen.getByTestId("selected-year").textContent).toBe(String(currentYear));
    expect(mockUseBudgetHistory).toHaveBeenCalledWith(currentYear);
  });

  // Req 7.1: Loading indicator is displayed while data is loading
  it("shows a skeleton when loading with no cached data", () => {
    mockUseBudgetHistory.mockReturnValue({
      chartData: [],
      availableYears: [],
      loading: true,
      error: null,
      retry: mockRetry,
    });

    render(<BudgetHistoryPage />);

    const loadingStatus = screen.getByRole("status");
    expect(loadingStatus).toBeTruthy();
    expect(screen.getByTestId("history-page-skeleton")).toBeTruthy();
  });

  // Req 6.2: Chart renders with cached data even while loading
  it("renders the chart with cached data while loading", () => {
    mockUseBudgetHistory.mockReturnValue({
      chartData: chartDataWithValues,
      availableYears: [2025],
      loading: true,
      error: null,
      retry: mockRetry,
    });

    render(<BudgetHistoryPage />);

    expect(screen.getByTestId("history-bar-chart")).toBeTruthy();
    expect(screen.queryByTestId("history-page-skeleton")).toBeNull();
  });

  // Req 7.2: Error message is displayed when API fails
  it("shows an error message when the API request fails", () => {
    mockUseBudgetHistory.mockReturnValue({
      chartData: [],
      availableYears: [],
      loading: false,
      error: "Error al cargar el historial.",
      retry: mockRetry,
    });

    render(<BudgetHistoryPage />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeTruthy();
    expect(screen.getByText("Error al cargar el historial.")).toBeTruthy();
  });

  // Req 7.3: Retry button is available on error
  it("shows a retry button when an error occurs", () => {
    mockUseBudgetHistory.mockReturnValue({
      chartData: [],
      availableYears: [],
      loading: false,
      error: "Error al cargar el historial.",
      retry: mockRetry,
    });

    render(<BudgetHistoryPage />);

    const retryButton = screen.getByText("Reintentar");
    expect(retryButton).toBeTruthy();
  });

  // Req 7.3: Clicking retry calls the retry function
  it("calls retry when the retry button is clicked", () => {
    mockUseBudgetHistory.mockReturnValue({
      chartData: [],
      availableYears: [],
      loading: false,
      error: "Error al cargar el historial.",
      retry: mockRetry,
    });

    render(<BudgetHistoryPage />);

    fireEvent.click(screen.getByText("Reintentar"));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  // Req 3.4: Empty year shows "no data" message
  it("shows 'no data' message when the selected year has no data", () => {
    mockUseBudgetHistory.mockReturnValue({
      chartData: emptyChartData,
      availableYears: [2025],
      loading: false,
      error: null,
      retry: mockRetry,
    });

    render(<BudgetHistoryPage />);

    expect(screen.getByText("No hay datos para este año")).toBeTruthy();
    expect(screen.queryByTestId("history-bar-chart")).toBeNull();
  });

  // Req 2.1: Chart renders when data is available
  it("renders the chart when data is available", () => {
    mockUseBudgetHistory.mockReturnValue({
      chartData: chartDataWithValues,
      availableYears: [2025, 2024],
      loading: false,
      error: null,
      retry: mockRetry,
    });

    render(<BudgetHistoryPage />);

    expect(screen.getByTestId("history-bar-chart")).toBeTruthy();
  });

  // Req 1.2: Navigation link back to dashboard exists
  it("includes a navigation link back to the dashboard", () => {
    mockUseBudgetHistory.mockReturnValue({
      chartData: chartDataWithValues,
      availableYears: [2025],
      loading: false,
      error: null,
      retry: mockRetry,
    });

    render(<BudgetHistoryPage />);

    const backLink = screen.getByLabelText("Volver al dashboard");
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute("href")).toBe("/user/dashboard");
  });
});
