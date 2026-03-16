# Reglas de arquitectura y separación de responsabilidades

## Principio general

Los componentes deben ser pequeños, enfocados y reutilizables. Un componente que crece demasiado es una señal de que necesita dividirse o que su lógica debe extraerse.

## Separación UI / Lógica

### Lógica de negocio y utilidades → `lib/`

Mover a `lib/` cuando la lógica:
- No depende del ciclo de vida de React (sin hooks)
- Es reutilizable entre múltiples componentes
- Realiza cálculos, transformaciones de datos o formateos

```typescript
// lib/calculations.ts
export function calculateSavingsRate(income: number, savings: number): number {
  return income > 0 ? (savings / income) * 100 : 0;
}
```

### Lógica con estado o efectos → `hooks/`

Mover a `hooks/` cuando la lógica:
- Usa `useState`, `useEffect`, `useCallback`, `useMemo` u otros hooks de React
- Gestiona estado local que podría reutilizarse en más de un componente
- Encapsula una funcionalidad compleja con efectos secundarios

```typescript
// hooks/useAnimatedValue.ts
export function useAnimatedValue(target: number) {
  const [current, setCurrent] = useState(0);
  useEffect(() => { /* animación */ }, [target]);
  return current;
}
```

### Regla de decisión

```
¿Usa hooks de React?
  ├── Sí → hooks/
  └── No → lib/
```

## Tamaño de componentes

- Un componente no debería superar ~150 líneas. Si lo hace, evaluar si parte de su JSX puede extraerse como subcomponente.
- Evitar componentes que hagan más de una cosa: renderizar UI compleja **y** gestionar lógica de negocio pesada al mismo tiempo.
- Preferir componer componentes pequeños sobre escribir un componente grande con muchas condiciones internas.

## Estilos

- Todos los valores de color, espaciado, tipografía y radios se importan de `@/lib/theme`. Nunca usar valores hardcoded.
- Los estilos se aplican mediante objetos inline con tokens del tema.

```typescript
// ✅ Correcto
import { COLORS, SPACING, RADIUS } from '@/lib/theme';
style={{ backgroundColor: COLORS.card, padding: SPACING[3], borderRadius: RADIUS.lg }}

// ❌ Incorrecto
style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '10px' }}
```

## Iconos

Usar siempre `lucide-react` para iconos. No añadir otras librerías de iconos.