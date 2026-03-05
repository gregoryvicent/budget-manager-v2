"use client";

import { useState, useEffect } from "react";

interface AnimatedNumberProps {
    value: number;
    prefix?: string;
    suffix?: string;
}

export default function AnimatedNumber({ value, prefix = "$", suffix = "" }: AnimatedNumberProps) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 800;
        const step = (end - start) / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
                setDisplay(end);
                clearInterval(timer);
            } else {
                setDisplay(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>
            {prefix}{display.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
        </span>
    );
}
