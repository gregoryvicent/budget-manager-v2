/**
 * Props for the {@link AnimatedNumber} component.
 *
 * @property {number}  value   - The target numeric value (in USD) to animate towards.
 * @property {string}  [prefix] - Symbol displayed before the number. When omitted,
 *   the active currency symbol from `useCurrency()` is used (e.g. "€", "COL$").
 *   Pass an explicit string (including `"$"`) to override the currency symbol.
 * @property {string}  [suffix] - Text appended after the formatted number.
 */
export interface AnimatedNumberProps {
    value: number;
    prefix?: string;
    suffix?: string;
}
