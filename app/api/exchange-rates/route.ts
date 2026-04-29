import { NextResponse } from "next/server";

/**
 * Response structure for the exchange rates endpoint.
 *
 * @property base - The base currency (always "USD")
 * @property rates - Map of currency codes to their exchange rates relative to USD
 * @property updatedAt - ISO 8601 timestamp of when the rates were last fetched
 * @property error - Optional error message when the API call fails
 */
interface ExchangeRatesResponse {
  base: "USD";
  rates: Record<string, number>;
  updatedAt: string;
  error?: string;
}

/**
 * Structure of a single rate entry from the Frankfurter API v2 response.
 */
interface FrankfurterRateEntry {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

/** Frankfurter API endpoint for USD-based exchange rates. */
const FRANKFURTER_URL = "https://api.frankfurter.dev/v2/rates?base=USD";

/** Cache duration in milliseconds (1 hour). */
const CACHE_DURATION_MS = 60 * 60 * 1000;

/** Module-level cached rates map. */
let cachedRates: Record<string, number> | null = null;

/** Module-level timestamp of when rates were last fetched. */
let cachedAt: number | null = null;

/** Module-level cached ISO timestamp string. */
let cachedUpdatedAt: string | null = null;

/**
 * Checks whether the current cache is still valid (less than 1 hour old).
 *
 * @returns True if the cache exists and is less than CACHE_DURATION_MS old
 */
function isCacheValid(): boolean {
  return cachedAt !== null && Date.now() - cachedAt < CACHE_DURATION_MS;
}

/**
 * Fetches fresh exchange rates from the Frankfurter API and updates the cache.
 *
 * @returns The rates map with USD: 1 included
 * @throws Error if the API request fails or returns invalid data
 */
async function fetchRates(): Promise<Record<string, number>> {
  const response = await fetch(FRANKFURTER_URL, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(
      `Frankfurter API returned status ${response.status}`
    );
  }

  const data: FrankfurterRateEntry[] = await response.json();
  const rates: Record<string, number> = { USD: 1 };
  for (const entry of data) {
    rates[entry.quote] = entry.rate;
  }

  cachedRates = rates;
  cachedAt = Date.now();
  cachedUpdatedAt = new Date().toISOString();

  return rates;
}

/**
 * GET handler for /api/exchange-rates.
 *
 * Returns exchange rates relative to USD. Rates are cached server-side
 * for 1 hour to avoid excessive calls to the Frankfurter API.
 *
 * - If the cache is fresh (< 1 hour), returns cached rates immediately.
 * - If the Frankfurter API fails, returns stale cache if available.
 * - If no cache exists and the API fails, returns empty rates with an error message.
 *
 * @returns ExchangeRatesResponse with base "USD", rates map, and updatedAt timestamp
 */
export async function GET() {
  // Return cached rates if still valid
  if (isCacheValid() && cachedRates && cachedUpdatedAt) {
    const response: ExchangeRatesResponse = {
      base: "USD",
      rates: cachedRates,
      updatedAt: cachedUpdatedAt,
    };
    return NextResponse.json(response);
  }

  try {
    const rates = await fetchRates();
    const response: ExchangeRatesResponse = {
      base: "USD",
      rates,
      updatedAt: cachedUpdatedAt!,
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    // Return stale cache if available
    if (cachedRates && cachedUpdatedAt) {
      const response: ExchangeRatesResponse = {
        base: "USD",
        rates: cachedRates,
        updatedAt: cachedUpdatedAt,
        error: `Using stale cache: ${message}`,
      };
      return NextResponse.json(response);
    }

    // No cache at all — return empty rates with error
    const response: ExchangeRatesResponse = {
      base: "USD",
      rates: {},
      updatedAt: new Date().toISOString(),
      error: `Failed to fetch exchange rates: ${message}`,
    };
    return NextResponse.json(response, { status: 502 });
  }
}
