"use client";

import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { CurrencyContext, type CurrencyContextValue } from "@/hooks/useCurrency";
import { getCurrencyByCode, DEFAULT_CURRENCY, type CurrencyConfig } from "@/lib/currencies";

// ─── Constants ───────────────────────────────────────────────────────────────

/** localStorage key used to persist the user's preferred currency code. */
const STORAGE_KEY = "preferredCurrency";

// ─── Props ───────────────────────────────────────────────────────────────────

/**
 * Props for the {@link CurrencyProvider} component.
 *
 * @property {ReactNode} children - The component tree that will have access
 *   to the currency context via `useCurrency()`.
 */
interface CurrencyProviderProps {
    children: ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Provides the currency context to all descendant components.
 *
 * On mount the provider:
 * 1. Reads the user's preferred currency from `localStorage.preferredCurrency`.
 * 2. Fetches exchange rates from `/api/exchange-rates` once.
 * 3. Falls back to USD silently if either step fails.
 *
 * The context value exposes the active currency, exchange rates, and helper
 * functions for converting and formatting monetary amounts.
 *
 * @param {CurrencyProviderProps} props
 * @returns {JSX.Element} A context provider wrapping `children`.
 *
 * @example
 * <CurrencyProvider>
 *   <Dashboard />
 * </CurrencyProvider>
 */
export default function CurrencyProvider({ children }: CurrencyProviderProps) {
    const [currency, setCurrencyState] = useState<CurrencyConfig>(DEFAULT_CURRENCY);
    const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
    const [loading, setLoading] = useState(true);

    // ── Initialization (localStorage + API fetch) ────────────────────────
    useEffect(() => {
        // Read persisted preference
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCurrencyState(getCurrencyByCode(stored));
            }
        } catch {
            // localStorage unavailable — keep USD default
        }

        // Fetch exchange rates once
        fetch("/api/exchange-rates")
            .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
            .then((data: { rates: Record<string, number> }) => {
                if (data.rates && Object.keys(data.rates).length > 0) {
                    setRates({ USD: 1, ...data.rates });
                }
            })
            .catch(() => {
                // Fetch failed — keep USD without error
            })
            .finally(() => setLoading(false));
    }, []);

    // ── setCurrency ──────────────────────────────────────────────────────

    /**
     * Updates the active currency and persists the choice in localStorage.
     *
     * @param {string} code - ISO 4217 currency code (e.g. "EUR", "COP").
     */
    const setCurrency = useCallback((code: string) => {
        const config = getCurrencyByCode(code);
        setCurrencyState(config);
        try {
            localStorage.setItem(STORAGE_KEY, config.code);
        } catch {
            // localStorage unavailable — preference won't persist
        }
    }, []);

    // ── Conversion functions ─────────────────────────────────────────────

    /**
     * Converts a USD amount to the active currency.
     *
     * @param {number} amountUsd - Amount in USD.
     * @returns {number} Equivalent amount in the active currency.
     */
    const convert = useCallback(
        (amountUsd: number): number => {
            const rate = rates[currency.code] ?? 1;
            return amountUsd * rate;
        },
        [rates, currency.code],
    );

    /**
     * Converts a local-currency amount back to USD.
     *
     * @param {number} amountLocal - Amount in the active currency.
     * @returns {number} Equivalent amount in USD.
     */
    const toUsd = useCallback(
        (amountLocal: number): number => {
            const rate = rates[currency.code] ?? 1;
            return amountLocal / rate;
        },
        [rates, currency.code],
    );

    /**
     * Converts a USD amount to the active currency and formats it as a
     * locale-aware string using `Intl.NumberFormat`.
     *
     * @param {number} amountUsd - Amount in USD.
     * @returns {string} Formatted string (e.g. "COL$415,025.00").
     */
    const formatAmount = useCallback(
        (amountUsd: number): string => {
            const converted = convert(amountUsd);
            const absConverted = Math.abs(converted);
            // Drop decimals for large values to keep text compact on mobile
            const fractionDigits = absConverted >= 1000 ? 0 : 2;
            return new Intl.NumberFormat(currency.locale, {
                style: "currency",
                currency: currency.code,
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            }).format(converted);
        },
        [convert, currency.locale, currency.code],
    );

    // ── Rate info ────────────────────────────────────────────────────────

    /**
     * Human-readable rate string, e.g. "1 USD = 4,150.25 COP".
     * `null` when the active currency is USD (no conversion).
     */
    const rateInfo = useMemo<string | null>(() => {
        if (currency.code === "USD") return null;
        const rate = rates[currency.code];
        if (rate == null) return null;

        const formattedRate = new Intl.NumberFormat(currency.locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(rate);

        return `1 USD = ${formattedRate} ${currency.code}`;
    }, [currency.code, currency.locale, rates]);

    // ── Context value ────────────────────────────────────────────────────

    const value = useMemo<CurrencyContextValue>(
        () => ({
            currency,
            setCurrency,
            rates,
            convert,
            toUsd,
            formatAmount,
            rateInfo,
            loading,
        }),
        [currency, setCurrency, rates, convert, toUsd, formatAmount, rateInfo, loading],
    );

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}
