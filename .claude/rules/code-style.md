# Reglas de estilo de código

## TypeScript

- Modo estricto activo (`strict: true`). Respetar siempre todas sus restricciones.
- Nunca usar `any`. Si el tipo es desconocido, usar `unknown` y acotar con guards.
- Preferir interfaces sobre `type` para definir formas de objetos.
- Usar el alias de path `@/` para todas las importaciones internas (nunca rutas relativas con `../../`).

## Funciones y componentes

- Usar funciones flecha para callbacks y utilidades en `lib/` y `hooks/`.
- Usar declaraciones de función (`export default function`) para componentes React.
- Nombrar funciones y variables en **camelCase**, componentes y tipos en **PascalCase**.
- Evitar funciones anónimas inline en JSX cuando la lógica es compleja — extraerlas y nombrarlas.

## Imports

Ordenar los imports en este orden:
1. Módulos de Node / externos (React, Next.js, librerías)
2. Componentes internos (`@/components/...`)
3. Hooks (`@/hooks/...`)
4. Utilidades y tema (`@/lib/...`)
5. Tipos (`./types/...`)

## Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componente | PascalCase | `MetricCard` |
| Hook | camelCase con prefijo `use` | `useAnimatedValue` |
| Utilidad / helper | camelCase | `formatCurrency` |
| Constante global | UPPER_SNAKE_CASE | `COLORS`, `SPACING` |
| Interfaz de props | NombreComponenteProps | `MetricCardProps` |

## Calidad general

- No dejar `console.log` en código mergeado.
- No dejar código comentado sin justificación — si ya no se usa, eliminarlo.
- No crear archivos o abstracciones para uso único — tres líneas similares no justifican un helper.
- No añadir manejo de errores, validaciones o feature flags para escenarios que no pueden ocurrir.
