// ─── Currency Configuration ──────────────────────────────────────────────────

/**
 * Configuration for a supported currency.
 *
 * @property {string} code   - ISO 4217 currency code (e.g. "USD", "EUR", "COP").
 * @property {string} symbol - Display symbol (e.g. "$", "€", "COL$").
 * @property {string} name   - Full currency name in English.
 * @property {string} locale - BCP 47 locale tag for number formatting.
 * @property {string} flag   - Emoji flag of the issuing country/region.
 */
export interface CurrencyConfig {
    code:   string;
    symbol: string;
    name:   string;
    locale: string;
    flag:   string;
}

/**
 * All currencies supported by the multi-currency display feature.
 *
 * Each entry contains the ISO code, display symbol, human-readable name,
 * locale for `Intl.NumberFormat`, and an emoji flag.
 */
export const SUPPORTED_CURRENCIES: readonly CurrencyConfig[] = [
    { code: "USD", symbol: "$",    name: "US Dollar",          locale: "en-US", flag: "🇺🇸" },
    { code: "EUR", symbol: "€",    name: "Euro",               locale: "de-DE", flag: "🇪🇺" },
    { code: "GBP", symbol: "£",    name: "British Pound",      locale: "en-GB", flag: "🇬🇧" },
    { code: "COP", symbol: "COL$", name: "Colombian Peso",     locale: "es-CO", flag: "🇨🇴" },
    { code: "MXN", symbol: "MX$",  name: "Mexican Peso",       locale: "es-MX", flag: "🇲🇽" },
    { code: "ARS", symbol: "AR$",  name: "Argentine Peso",     locale: "es-AR", flag: "🇦🇷" },
    { code: "BRL", symbol: "R$",   name: "Brazilian Real",     locale: "pt-BR", flag: "🇧🇷" },
    { code: "CLP", symbol: "CL$",  name: "Chilean Peso",       locale: "es-CL", flag: "🇨🇱" },
    { code: "PEN", symbol: "S/",   name: "Peruvian Sol",       locale: "es-PE", flag: "🇵🇪" },
    { code: "VES", symbol: "Bs.",  name: "Venezuelan Bolívar", locale: "es-VE", flag: "🇻🇪" },
] as const;

/**
 * Finds a currency configuration by its ISO 4217 code.
 *
 * Returns the matching `CurrencyConfig` if found, or the default
 * currency (USD) when the code is not recognized.
 *
 * @param {string} code - ISO 4217 currency code (case-insensitive).
 * @returns {CurrencyConfig} The matching currency config, or USD as fallback.
 *
 * @example
 * getCurrencyByCode("COP");
 * // => { code: "COP", symbol: "COL$", name: "Colombian Peso", locale: "es-CO", flag: "🇨🇴" }
 *
 * getCurrencyByCode("UNKNOWN");
 * // => { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", flag: "🇺🇸" }
 */
export const getCurrencyByCode = (code: string): CurrencyConfig => {
    const upper = code.toUpperCase();
    return SUPPORTED_CURRENCIES.find((c) => c.code === upper) ?? DEFAULT_CURRENCY;
};

/**
 * The default currency used when no preference is set.
 * Points to USD (US Dollar).
 */
export const DEFAULT_CURRENCY: CurrencyConfig = SUPPORTED_CURRENCIES[0];
