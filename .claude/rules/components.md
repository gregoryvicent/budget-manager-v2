# Reglas de estructura de componentes

## Estructura de carpetas

Cada componente vive en su propia carpeta con `index.tsx` como punto de entrada:

```
components/
└── MyComponent/
    ├── index.tsx
    └── types/
        └── MyComponentProps.ts
```

- Nombre de carpeta en **PascalCase**
- Nunca crear componentes como archivos sueltos (ej. `MyComponent.tsx` en la raíz de `components/`)
- Las interfaces y tipos del componente viven en `MyComponent/types/`, nunca inline en `index.tsx`
- Si el componente necesita subcomponentes internos, colocarlos como archivos adicionales dentro de la misma carpeta

```
components/
└── MyComponent/
    ├── index.tsx             # Componente principal y export default
    ├── MySubPart.tsx         # Subcomponentes internos (no se exportan fuera)
    └── types/
        └── MyComponentProps.ts   # Interfaces y tipos del componente
```

## Definición de props

Las interfaces de props se definen en `types/MyComponentProps.ts` y se importan en `index.tsx`:

```typescript
// components/MyComponent/types/MyComponentProps.ts
export interface MyComponentProps {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}
```

```typescript
// components/MyComponent/index.tsx
import { MyComponentProps } from './types/MyComponentProps';

export default function MyComponent({ label, value, color, icon: Icon }: MyComponentProps) {
  // ...
}
```

- Usar destructuring directamente en los parámetros de la función
- No usar `React.FC<Props>` — preferir la firma de función directa
- No usar `any` bajo ninguna circunstancia

## Directiva "use client"

Añadir `"use client"` solo cuando el componente use hooks de estado o efectos del lado del cliente (`useState`, `useEffect`, event handlers, etc.). Si el componente es puramente visual y no tiene interactividad, omitirla.

## Exportaciones

Usar siempre `export default` en el `index.tsx` del componente. No mezclar named exports y default exports en el mismo archivo de componente.
