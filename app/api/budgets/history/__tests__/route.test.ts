import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock requireAuth
const mockRequireAuth = vi.fn();
vi.mock("@/lib/apiAuth", () => ({
  requireAuth: () => mockRequireAuth(),
}));

// Mock getBudgetHistory
const mockGetBudgetHistory = vi.fn();
vi.mock("@/backend/application/budgetManager/GetBudgetHistory", () => ({
  getBudgetHistory: (...args: unknown[]) => mockGetBudgetHistory(...args),
}));

// Mock Prisma repositories (module-level instantiation in route.ts)
vi.mock("@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository", () => ({
  PrismaBudgetMonthRepository: vi.fn(),
}));
vi.mock("@/backend/adapters/db/prisma/budgetManager/PrismaIncomeEntryRepository", () => ({
  PrismaIncomeEntryRepository: vi.fn(),
}));
vi.mock("@/backend/adapters/db/prisma/budgetManager/PrismaExpenseEntryRepository", () => ({
  PrismaExpenseEntryRepository: vi.fn(),
}));

import { GET } from "../route";

/**
 * Helper to build a NextRequest with the given search params.
 */
function makeRequest(params?: Record<string, string>): NextRequest {
  const url = new URL("http://localhost/api/budgets/history");
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  return new NextRequest(url);
}

describe("GET /api/budgets/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Req 4.6: Unauthenticated request returns 401
  it("returns 401 when user is not authenticated", async () => {
    mockRequireAuth.mockRejectedValue({ status: 401, message: "Autenticación requerida." });

    const res = await GET(makeRequest({ year: "2025" }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Autenticación requerida.");
  });

  // Req 4.2: Missing year param returns 400
  it("returns 400 when year param is missing", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("year");
  });

  // Req 4.2: Non-integer year returns 400
  it("returns 400 when year is not a valid integer", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });

    const res = await GET(makeRequest({ year: "abc" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("year");
  });

  // Req 4.2: Decimal year returns 400
  it("returns 400 when year is a decimal number", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });

    const res = await GET(makeRequest({ year: "2025.5" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("year");
  });

  // Req 4.1, 4.3: Valid request returns correct MonthlySummary structure
  it("returns MonthlySummary array for a valid request", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });
    const summaries = [
      { year: 2025, month: 1, totalIncome: 5000, totalExpenses: 3000 },
      { year: 2025, month: 2, totalIncome: 4500, totalExpenses: 2800 },
    ];
    mockGetBudgetHistory.mockResolvedValue(summaries);

    const res = await GET(makeRequest({ year: "2025" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(summaries);
    expect(body).toHaveLength(2);
    for (const entry of body) {
      expect(entry).toHaveProperty("year");
      expect(entry).toHaveProperty("month");
      expect(entry).toHaveProperty("totalIncome");
      expect(entry).toHaveProperty("totalExpenses");
    }
  });

  // Req 4.1: Empty result for year with no data
  it("returns empty array when no data exists for the year", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });
    mockGetBudgetHistory.mockResolvedValue([]);

    const res = await GET(makeRequest({ year: "2020" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });

  // Internal server error returns 500
  it("returns 500 when an unexpected error occurs", async () => {
    mockRequireAuth.mockResolvedValue({ userId: "user-1" });
    mockGetBudgetHistory.mockRejectedValue(new Error("DB connection failed"));

    const res = await GET(makeRequest({ year: "2025" }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("DB connection failed");
  });
});
