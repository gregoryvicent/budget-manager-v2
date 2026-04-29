"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import {
    COLORS,
    RADIUS,
    FONT_SIZES,
    FONT_WEIGHTS,
    FONTS,
    TRANSITIONS,
    SPACING,
    Z_INDEX,
} from "@/lib/theme";
import type { CurrencySelectorProps } from "./types/CurrencySelectorProps";

/**
 * Compact dropdown selector for the active display currency.
 *
 * The trigger button shows the flag emoji and ISO code of the currently
 * active currency (e.g. "🇺🇸 USD"). Clicking it opens an absolutely-
 * positioned dropdown listing every entry in {@link SUPPORTED_CURRENCIES}.
 *
 * Each dropdown option renders: flag, ISO code, and symbol
 * (e.g. "🇨🇴 COP — COL$"). The active currency row is highlighted
 * with {@link COLORS.accent}.
 *
 * The dropdown closes when the user selects a currency **or** clicks
 * anywhere outside the component (detected via a `mousedown` listener
 * attached to `document`).
 *
 * Styling is consistent with the other header buttons in
 * {@link DashboardHeader}: 44 × 44 px, `RADIUS.xl` border-radius,
 * `COLORS.card` background with a `COLORS.cardBorder` border.
 *
 * @example
 * ```tsx
 * <CurrencySelector />
 * ```
 */
export default function CurrencySelector(_props: CurrencySelectorProps) {
    const { currency, setCurrency } = useCurrency();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Close on outside click ───────────────────────────────────────────
    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (
            containerRef.current &&
            !containerRef.current.contains(e.target as Node)
        ) {
            setOpen(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, handleClickOutside]);

    // ── Handlers ─────────────────────────────────────────────────────────

    /**
     * Selects a currency by ISO code, updates the context, and closes the dropdown.
     *
     * @param {string} code - ISO 4217 currency code.
     */
    const handleSelect = (code: string) => {
        setCurrency(code);
        setOpen(false);
    };

    // ── Render ───────────────────────────────────────────────────────────

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            {/* Trigger button */}
            <button
                type="button"
                aria-label={`Currency: ${currency.code}. Click to change`}
                aria-expanded={open}
                aria-haspopup="listbox"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center justify-center gap-1 shrink-0 min-h-[44px] min-w-[44px] cursor-pointer"
                style={{
                    height: 44,
                    paddingLeft: SPACING["2.5"],
                    paddingRight: SPACING["2.5"],
                    borderRadius: RADIUS.xl,
                    background: COLORS.card,
                    border: `1px solid ${COLORS.cardBorder}`,
                    transition: `background ${TRANSITIONS.base}`,
                    fontFamily: FONTS.body,
                    fontSize: FONT_SIZES.sm,
                    fontWeight: FONT_WEIGHTS.semibold,
                    color: COLORS.muted,
                    whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background = COLORS.cardBorder)
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background = COLORS.card)
                }
            >
                <span style={{ fontSize: FONT_SIZES.base, lineHeight: 1 }}>
                    {currency.flag}
                </span>
                <span>{currency.code}</span>
            </button>

            {/* Dropdown */}
            {open && (
                <ul
                    role="listbox"
                    aria-label="Select currency"
                    className="left-0 sm:left-auto sm:right-0"
                    style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        zIndex: Z_INDEX.overlay,
                        minWidth: 200,
                        maxWidth: "calc(100vw - 2rem)",
                        maxHeight: 320,
                        overflowY: "auto",
                        margin: 0,
                        padding: `${SPACING["1"]}px 0`,
                        listStyle: "none",
                        background: COLORS.card,
                        border: `1px solid ${COLORS.cardBorder}`,
                        borderRadius: RADIUS.xl,
                        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
                    }}
                >
                    {SUPPORTED_CURRENCIES.map((c) => {
                        const isActive = c.code === currency.code;
                        return (
                            <li key={c.code}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    onClick={() => handleSelect(c.code)}
                                    className="flex items-center gap-2 w-full cursor-pointer"
                                    style={{
                                        padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                                        background: "transparent",
                                        border: "none",
                                        fontFamily: FONTS.body,
                                        fontSize: FONT_SIZES.body,
                                        fontWeight: isActive
                                            ? FONT_WEIGHTS.bold
                                            : FONT_WEIGHTS.medium,
                                        color: isActive
                                            ? COLORS.accent
                                            : COLORS.textDim,
                                        transition: `background ${TRANSITIONS.fast}, color ${TRANSITIONS.fast}`,
                                        textAlign: "left",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            COLORS.cardBorder;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "transparent";
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: FONT_SIZES.base,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {c.flag}
                                    </span>
                                    <span>
                                        {c.code} — {c.symbol}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
