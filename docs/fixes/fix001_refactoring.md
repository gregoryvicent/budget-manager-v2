# FIX-001: Refactoring — Cumplimiento de reglas del proyecto

Auditoría realizada el **2026-03-16** contra las reglas definidas en `.claude/rules/`.
Correcciones completadas el **2026-03-16**. Build verificado exitosamente.

---

## 1. Tipos inline en componentes

**Regla violada:** `components.md` — *"Las interfaces y tipos del componente viven en `MyComponent/types/`, nunca inline en `index.tsx`"*

- [x] `components/AnimatedNumber/index.tsx` — Extraído `AnimatedNumberProps` a `types/AnimatedNumberProps.ts`
- [x] `components/MetricCard/index.tsx` — Extraído `MetricCardProps` a `types/MetricCardProps.ts`
- [x] `components/EditableList/index.tsx` — Extraído `EditableListProps` a `types/EditableListProps.ts`
- [x] `components/SavingsCard/index.tsx` — Extraído `SavingsCardProps` a `types/SavingsCardProps.ts`
- [x] `components/ProgressRing/index.tsx` — Extraído `ProgressRingProps` a `types/ProgressRingProps.ts`
- [x] `components/Sidebar/index.tsx` — Extraído `SidebarProps` a `types/SidebarProps.ts`
- [x] `components/DistributionChart/index.tsx` — Extraído `PieDataItem`, `DistributionChartProps` y `CustomLabelProps` a archivos en `types/`
- [x] `components/FinancialSummaryChart/index.tsx` — Extraído `BarDataItem` y `FinancialSummaryChartProps` a archivos en `types/`

---

## 2. Named exports mezclados con default export

**Regla violada:** `components.md` — *"No mezclar named exports y default exports en el mismo archivo de componente."*

- [x] `components/DistributionChart/index.tsx` — Movido `PieDataItem` a `types/PieDataItem.ts`. Solo queda `export default`.
- [x] `components/FinancialSummaryChart/index.tsx` — Movido `BarDataItem` a `types/BarDataItem.ts`. Solo queda `export default`.

---

## 3. Uso de `any`

**Regla violada:** `code-style.md` — *"Nunca usar `any`. Si el tipo es desconocido, usar `unknown` y acotar con guards."*

- [x] `components/DistributionChart/index.tsx` — Reemplazado `any` por interfaces `CustomTooltipProps` y `TooltipEntry` con tipos explícitos. Eliminado `eslint-disable`.

---

## 4. `type` en lugar de `interface` para objetos

**Regla violada:** `code-style.md` — *"Preferir interfaces sobre `type` para definir formas de objetos."*

- [x] `lib/theme.ts` — `ListItem` movido a `lib/types.ts` como `interface` (ver punto 10).

---

## 5. Falta directiva `"use client"`

**Regla violada:** `components.md` — *"Añadir `"use client"` cuando el componente use hooks de estado o efectos del lado del cliente."*

- [x] `components/SavingsCard/index.tsx` — Añadida directiva `"use client"` como primera línea.

---

## 6. Valores hardcodeados en lugar de tokens del tema

**Regla violada:** `architecture.md` — *"Todos los valores de color, espaciado, tipografía y radios se importan de `@/lib/theme`. Nunca usar valores hardcoded."*

Se añadieron nuevos tokens al tema para cubrir los valores faltantes:
- `SPACING`: `"1.5": 6`, `"2.5": 10`, `"3.5": 14`, `"8": 32`
- `RADIUS`: `"2xl": 14`

### 6.1 Colores hardcodeados

- [x] `app/page.tsx` — `color: "#fff"` → `COLORS.text`

### 6.2 Espaciado hardcodeado

- [x] `app/page.tsx` — `marginBottom: 32` → `SPACING["8"]`
- [x] `components/MetricCard/index.tsx` — `28px` → `SPACING["7"]`, `padding: 14` → `SPACING["3.5"]`, `marginBottom: 6` → `SPACING["1.5"]`, `gap: 4` → `SPACING["1"]`
- [x] `components/FinancialSummaryChart/index.tsx` — `marginBottom: 20` → `SPACING["5"]`, `gap: 12` → `SPACING["3"]`, `gap: 5` → `SPACING["1"]`, `gap: 7` → `SPACING["2"]`, `gap: 10` → `SPACING["2.5"]`
- [x] `components/EditableList/index.tsx` — `SPACING["2"] + 2` → `SPACING["2.5"]`, `14px` → `SPACING["3.5"]`, `gap: 6` → `SPACING["1.5"]`, `padding: 2` → `SPACING["1"]`, `5px` → `SPACING["1"]`, `color: "#fff"` → `COLORS.text`
- [x] `components/SavingsCard/index.tsx` — `SPACING["2"] + 2` → `SPACING["2.5"]`, `gap: 5` → `SPACING["1"]`, `fontSize: 26` → `FONT_SIZES["4xl"]`, `marginBottom: 1` → `SPACING["1"]`, `marginTop: 2` → `SPACING["1"]`
- [x] `components/Sidebar/index.tsx` — `gap: 6` → `SPACING["1.5"]`, `7px` → `SPACING["2"]`, `SPACING["2"] + 2` → `SPACING["2.5"]`, `marginBottom: 2` → `SPACING["1"]`
- [x] `app/page.tsx` — `SPACING["2"] + 2` → `SPACING["2.5"]` (3 ocurrencias)

### 6.3 Border radius hardcodeado

- [x] `components/MetricCard/index.tsx` — `borderRadius: 14` → `RADIUS["2xl"]`

---

## 7. Funciones en `lib/` usan declaración en vez de arrow function

**Regla violada:** `code-style.md` — *"Usar funciones flecha para callbacks y utilidades en `lib/`."*

- [x] `lib/theme.ts` — `formatCurrency` convertida a arrow function.
- [x] `lib/theme.ts` — `withAlpha` convertida a arrow function.

---

## 8. Documentación incompleta en funciones exportadas de `lib/`

**Regla violada:** `documentation.md` — *"Todas las funciones exportadas en `lib/` y `hooks/` deben tener JSDoc estilo Google."*

- [x] `lib/theme.ts` — `formatCurrency` ahora tiene JSDoc completo con `@param` y `@returns`.
- [x] `lib/theme.ts` — `withAlpha` ahora tiene JSDoc completo con `@param` y `@returns`.
- [x] `hooks/useBudgetCalculations.ts` — Nueva función con JSDoc completo.

---

## 9. Componentes que exceden ~150 líneas

**Regla violada:** `architecture.md` — *"Un componente no debería superar ~150 líneas."*

| Componente | Antes | Después | Subcomponentes extraídos |
|---|---|---|---|
| `SavingsCard` | 299 | 128 | `SavingsCardHeader`, `SavingsStats`, `SavingsProgressBar`, `GoalBanner` |
| `EditableList` | 234 | 118 | `EditableListItem`, `AddItemForm` |
| `page.tsx` | 265 | 193 | `DashboardHeader` + hook `useBudgetCalculations` |
| `Sidebar` | 197 | 156 | `YearMonthGrid` |

---

## 10. `ListItem` definido en `theme.ts`

**Regla violada:** `architecture.md` — *Separación de responsabilidades.*

- [x] `lib/theme.ts` — `ListItem` movido a `lib/types.ts` como `interface`. Todos los imports actualizados (`app/page.tsx`, `components/EditableList/index.tsx`, `components/EditableList/types/EditableListProps.ts`).

---

## Resumen

| #  | Categoría                              | Estado |
|----|----------------------------------------|--------|
| 1  | Tipos inline (sin carpeta `types/`)    | ✅     |
| 2  | Named + default exports mezclados      | ✅     |
| 3  | Uso de `any`                           | ✅     |
| 4  | `type` en vez de `interface`           | ✅     |
| 5  | Falta `"use client"`                   | ✅     |
| 6  | Valores hardcodeados                   | ✅     |
| 7  | Function declaration en `lib/`         | ✅     |
| 8  | JSDoc incompleto en `lib/`             | ✅     |
| 9  | Componentes > 150 líneas              | ✅     |
| 10 | `ListItem` en archivo incorrecto       | ✅     |

**Build verificado:** `next build` compila sin errores.
