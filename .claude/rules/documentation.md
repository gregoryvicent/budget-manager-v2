# Reglas de documentación y comentarios

## Principio

Los comentarios deben explicar el **por qué**, no el **qué**. El código bien escrito se explica solo; los comentarios añaden contexto que el código no puede expresar.

## Estilo de comentarios

Este proyecto usa el **estilo de comentarios de Google** (Google Style Comments). Las reglas generales son:

- Los comentarios de una línea usan `//` con un espacio después
- Los comentarios de bloque para funciones y clases usan `/** ... */`
- Cada parámetro relevante se documenta con `@param {tipo} nombre - descripción`
- El valor de retorno se documenta con `@returns {tipo} descripción`
- Los comentarios empiezan con mayúscula y terminan con punto

```typescript
/**
 * Calcula el porcentaje de ahorro sobre el ingreso total.
 *
 * @param {number} income - Ingreso total del mes.
 * @param {number} savings - Cantidad destinada a ahorro.
 * @returns {number} Porcentaje de ahorro, o 0 si el ingreso es 0.
 */
export function calculateSavingsRate(income: number, savings: number): number {
  // Evitar división por cero cuando no hay ingresos registrados.
  return income > 0 ? (savings / income) * 100 : 0;
}
```

## Cuándo comentar

**Sí comentar:**
- Lógica no obvia: fórmulas de negocio, decisiones de diseño con trade-offs, workarounds
- Todas las funciones exportadas en `lib/` y `hooks/`
- Constantes del tema en `lib/theme.ts` cuando su propósito no sea evidente

**No comentar:**
- Lo que el código ya dice claramente
- Código comentado sin justificación — eliminarlo directamente
- Cambios recientes ("// added X" o "// removed Y") — eso es para git

## Mantener comentarios actualizados

Al modificar una función o componente que ya tiene comentarios:
- Revisar si el comentario existente sigue siendo correcto
- Actualizar o eliminar comentarios que ya no reflejen la realidad
- Un comentario desactualizado es peor que no tener comentario

## Comentarios en componentes

Los componentes simples no necesitan comentario de cabecera. Solo añadir comentario cuando el componente tenga comportamiento no evidente:

```typescript
/**
 * Muestra un número con transición animada al cambiar de valor.
 * Usa requestAnimationFrame internamente para suavizar la animación frame a frame.
 */
export default function AnimatedNumber({ target }: AnimatedNumberProps) {
```
