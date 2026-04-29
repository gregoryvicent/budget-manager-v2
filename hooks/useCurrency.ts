"use client";

import { createContext, useContext } from "react";
import type { CurrencyConfig } from "@/lib/currencies";
import { DEFAULT_CURRENCY } from "@/lib/currencies";

// ─── Currency Context ────────────────────────────────────────────────────────

/**
 * Shape of the currency context value exposed to consumers.
 *
 * @property {CurrencyConfig} currency   - The currently active currency configuration.
 * @property {(code: string) => void} setCurrency - Updates the active currency by ISO 4217 code
 *   and persists the preference in `localStorage.preferredCurrency`.
 * @property {Record<string, number>} rates - Exchange rates relative to USD (e.g. `{ EUR: 0.92, COP: 4150 }`).
 *   Always includes `USD: 1`.
 * @property {(amountUsd: number) => number} convert - Converts a USD amount to the active currency
 *   by multiplying by `rates[currency.code]`. Returns the original value when no rate is available.
 * @property {(amountLocal: number) => number} toUsd - Converts a local-currency amount back to USD
 *   by dividing by `rates[currency.code]`. Used before sending values to the backend for storage.
 * @property {(amountUsd: number) => string} formatAmount - Converts a USD amount to the active
 *   currency and formats it using `Intl.NumberFormat` with the currency's locale and symbol.
 * @property {string | null} rateInfo - Human-readable rate string such as `"1 USD = 4,150.25 COP"`,
 *   or `null` when the active currency is USD (no conversion applied).
 * @property {boolean} loading - `true` while exchange rates are being fetched from `/api/exchange-rates`.
 */
export interface CurrencyContextValue {
    currency: CurrencyConfig;
    setCurrency: (code: string) => void;
    rates: Record<string, number>;
    convert: (amountUsd: number) => number;
    toUsd: (amountLocal: number) => number;
    formatAmount: (amountUsd: number) => string;
    rateInfo: string | null;
    loading: boolean;
}

/**
 * Default context value used when no `CurrencyProvider` is present in the tree.
 *
 * All conversion functions act as identity/no-op so the app degrades gracefully
 * to plain USD display if the provider is missing.
 */
const defaultContextValue: CurrencyContextValue = {
    currency: DEFAULT_CURRENCY,
    setCurrency: () => {},
    rates: { USD: 1 },
    convert: (amountUsd: number) => amountUsd,
    toUsd: (amountLocal: number) => amountLocal,
    formatAmount: (amountUsd: number) =>
        new Intl.NumberFormat(DEFAULT_CURRENCY.locale, {
            style: "currency",
            currency: DEFAULT_CURRENCY.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amountUsd),
    rateInfo: null,
    loading: false,
};

/**
 * React Context that holds the active currency state and conversion utilities.
 *
 * The context is created with a safe USD default so components that call
 * `useCurrency()` outside a `<CurrencyProvider>` still render without errors.
 *
 * The `CurrencyProvider` component (see `components/CurrencyProvider/index.tsx`)
 * supplies the real value — including fetched exchange rates, localStorage
 * persistence, and live conversion functions.
 *
 * @see CurrencyContextValue
 */
export const CurrencyContext = createContext<CurrencyContextValue>(defaultContextValue);

/**
 * Consumes the currency context provided by `<CurrencyProvider>`.
 *
 * Returns the active currency configuration, exchange rates, and helper
 * functions for converting and formatting monetary amounts.
 *
 * @returns {CurrencyContextValue} The current currency context value.
 *
 * @example
 * const { currency, convert, formatAmount, rateInfo } = useCurrency();
 *
 * // Convert 100 USD to the active currency
 * const localAmount = convert(100);
 *
 * // Format 100 USD as a localized string in the active currency
 * const formatted = formatAmount(100); // e.g. "COL$415,025.00"
 *
 * // Convert a local amount back to USD for storage
 * const usd = toUsd(415025);
 *
 * // Show rate info when not USD
 * if (rateInfo) console.log(rateInfo); // "1 USD = 4,150.25 COP"
 */
export const useCurrency = (): CurrencyContextValue => {
    return useContext(CurrencyContext);
};
