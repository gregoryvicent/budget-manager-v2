"use client";

import { useState, useEffect } from "react";
import { ANIMATION_DURATIONS } from "@/lib/theme";

interface AnimatedNumberProps {
    value: number;
    prefix?: string;
    suffix?: string;
}

const FRAME_MS = 16;

export default function AnimatedNumber({ value, prefix = "$", suffix = "" }: AnimatedNumberProps) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
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
    }, [value]);

    return (
        <span>
            {prefix}{display.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
        </span>
    );
}
