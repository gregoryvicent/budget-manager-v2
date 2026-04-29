/**
 * Props for the {@link CurrencySelector} component.
 *
 * Currently the component is self-contained — it reads the active currency
 * and the `setCurrency` callback from the `useCurrency()` context hook,
 * so no external props are required.
 *
 * The interface is kept as an explicit (empty) type so that future
 * extensions (e.g. `className`, `placement`, `onOpen`) can be added
 * without changing the import site.
 */
export interface CurrencySelectorProps {
    /* intentionally empty — all state comes from CurrencyContext */
}
