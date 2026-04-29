import { describe, it, expect } from "vitest";
import {
    SUPPORTED_CURRENCIES,
    getCurrencyByCode,
    DEFAULT_CURRENCY,
    type CurrencyConfig,
} from "@/lib/currencies";

describe("SUPPORTED_CURRENCIES", () => {
    it("contains exactly 10 currencies", () => {
        expect(SUPPORTED_CURRENCIES).toHaveLength(10);
    });

    it("includes all required currency codes", () => {
        const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
        expect(codes).toEqual([
            "USD", "EUR", "GBP", "COP", "MXN",
            "ARS", "BRL", "CLP", "PEN", "VES",
        ]);
    });

    it("every currency has complete data", () => {
        for (const currency of SUPPORTED_CURRENCIES) {
            expect(currency.code).toBeTruthy();
            expect(currency.symbol).toBeTruthy();
            expect(currency.name).toBeTruthy();
            expect(currency.locale).toBeTruthy();
            expect(currency.flag).toBeTruthy();
        }
    });
});

describe("getCurrencyByCode", () => {
    it("returns the COP config for code 'COP'", () => {
        const cop = getCurrencyByCode("COP");
        expect(cop).toEqual<CurrencyConfig>({
            code: "COP",
            symbol: "COL$",
            name: "Colombian Peso",
            locale: "es-CO",
            flag: "🇨🇴",
        });
    });

    it("is case-insensitive", () => {
        expect(getCurrencyByCode("eur").code).toBe("EUR");
        expect(getCurrencyByCode("Gbp").code).toBe("GBP");
    });

    it("returns USD as fallback for unknown codes", () => {
        expect(getCurrencyByCode("XYZ")).toEqual(DEFAULT_CURRENCY);
    });
});

describe("DEFAULT_CURRENCY", () => {
    it("is USD", () => {
        expect(DEFAULT_CURRENCY.code).toBe("USD");
        expect(DEFAULT_CURRENCY.symbol).toBe("$");
    });
});
