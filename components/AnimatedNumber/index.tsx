"use client";

import { useState, useEffect } from "react";
import { ANIMATION_DURATIONS } from "@/lib/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { AnimatedNumberProps } from "./types/AnimatedNumberProps";

const FRAME_MS = 16;

/**
 * Animates a numeric value from 0 to the target, displaying it with a
 * currency symbol and locale-aware formatting.
 *
 * When no explicit `prefix` is provided the component uses the active
 * currency symbol from `useCurrency()`. The raw USD `value` is converted
 * to the active currency via `convert()` before the animation runs, and
 * the formatted output uses the currency's locale for thousand/decimal
 * separators.
 *
 * @param {AnimatedNumberProps} props
 * @returns {JSX.Element} A `<span>` containing the animated, formatted number.
 *
 * @example
 * // Uses active currency symbol and conversion automatically
 * <AnimatedNumber value={1500} />
 *
 * // Explicit prefix overrides the currency symbol
 * <AnimatedNumber value={1500} prefix="USD " />
 */
export default function AnimatedNumber({ value, prefix, suffix = "" }: AnimatedNumberProps) {
    const { currency, convert } = useCurrency();

    const convertedValue = convert(value);
    const displayPrefix = prefix ?? currency.symbol;

    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = convertedValue;
        const step = (end - start) / (ANIMATION_DURATIONS.number / FRAME_MS);
        const timer = setInterval(() => {
            start += step;
            if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
                setDisplay(end);
                clearInterval(timer);
            } else {
                setDisplay(start);
            }
        }, FRAME_MS);
        return () => clearInterval(timer);
    }, [convertedValue]);

    const absDisplay = Math.abs(display);
    const fractionDigits = absDisplay >= 1000 ? 0 : 2;

    return (
        <span>
            {displayPrefix}{display.toLocaleString(currency.locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}{suffix}
        </span>
    );
}
