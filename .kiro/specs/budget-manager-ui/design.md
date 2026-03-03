# Documento de Diseño

## Visión General

Este documento describe el diseño técnico y visual de la interfaz de usuario del Budget Manager, una aplicación web construida con Next.js 16, React 19 y Tailwind CSS 4. El diseño se enfoca en crear una experiencia minimalista, limpia y profesional utilizando una paleta de colores armoniosa.

## Paleta de Colores

### Colores Principales

```css
--color-cream: #F6F0D7      /* Fondo base, áreas principales */
--color-sage-light: #C5D89D  /* Tarjetas, elementos destacados, ingresos */
--color-sage: #9CAB84        /* Acentos, hover, ahorros */
--color-sage-dark: #89986D   /* Textos, bordes, contraste */
```

### Aplicación de Colores

- **Fondos principales**: `#F6F0D7` (cream)
- **Tarjetas de ingresos**: `#C5D89D` (sage-light)
- **Tarjetas de ahorros**: `#9CAB84` (sage)
- **Tarjetas de gastos**: Tonos neutros derivados de la paleta
- **Alertas/Crítico**: `#89986D` (sage-dark) con variaciones
- **Texto principal**: `#89986D` o más oscuro para contraste
- **Bordes y separadores**: `#9CAB84` con opacidad reducida

## Arquitectura de Componentes

### Estructura de Carpetas

```
app/
├── page.tsx                    # Dashboard principal
├── layout.tsx                  # Layout raíz
└── globals.css                 # Estilos globales + Tailwind

components/
├── MetricsGrid/
│   └── index.tsx               # Grid de métricas principales
├── MetricCard/
│   └── index.tsx               # Tarjeta individual de métrica
├── IncomeSection/
│   └── index.tsx               # Sección de ingresos
├── ExpensesSection/
│   └── index.tsx               # Sección de gastos
├── SavingsSection/
│   └── index.tsx               # Sección de ahorros
├── VariablesSection/
│   └── index.tsx               # Variables adicionales
├── Card/
│   └── index.tsx               # Componente base de tarjeta
├── ProgressBar/
│   └── index.tsx               # Barra de progreso
├── Badge/
│   └── index.tsx               # Badge para etiquetas
├── Typography/
│   └── index.tsx               # Componentes de texto
├── DashboardLayout/
│   └── index.tsx               # Layout del dashboard
└── Container/
    └── index.tsx               # Contenedor responsivo
```

## Componentes Principales

### 1. Dashboard (page.tsx)

**Propósito**: Página principal que orquesta todos los componentes del dashboard.

**Estructura**:
```tsx
<DashboardLayout>
  <MetricsGrid />
  <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
    <div className="space-y-6">
      <IncomeSection />
      <ExpensesSection />
    </div>
    <SavingsSection />
  </div>
  <VariablesSection />
</DashboardLayout>
```

### 2. MetricsGrid

**Propósito**: Muestra las 5 métricas principales en la parte superior del dashboard.

**Props**:
```typescript
interface MetricsGridProps {
  totalIncome: number;
  totalExpenses: number;
  incomeUsedPercentage: number;
  fixedExpensesPercentage: number;
  totalExpensesPercentage: number;
}
```

**Layout**: Grid responsivo de 5 columnas en desktop, 2 columnas en tablet, 1 columna en móvil.

### 3. MetricCard

**Propósito**: Tarjeta reutilizable para mostrar una métrica individual.

**Props**:
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  secondaryValue?: string | number;
  variant: 'income' | 'expense' | 'savings' | 'neutral' | 'alert';
  showProgress?: boolean;
  progressValue?: number;
}
```

**Variantes de color**:
- `income`: Fondo `#C5D89D`
- `savings`: Fondo `#9CAB84`
- `expense`: Fondo `#F6F0D7` con borde
- `neutral`: Fondo blanco con borde
- `alert`: Fondo derivado de `#89986D` con tono cálido

### 4. IncomeSection

**Propósito**: Lista de fuentes de ingresos con totales.

**Estructura de datos**:
```typescript
interface IncomeItem {
  id: string;
  name: string;
  amount: number;
}

interface IncomeSectionProps {
  items: IncomeItem[];
  total: number;
}
```

**Diseño**:
- Tarjeta con fondo `#F6F0D7`
- Título "Fuentes de Ingresos"
- Lista de items con nombre y monto
- Total destacado al final

### 5. ExpensesSection

**Propósito**: Muestra gastos fijos y variables en secciones separadas.

**Estructura de datos**:
```typescript
interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'variable';
}

interface ExpensesSectionProps {
  fixedExpenses: ExpenseItem[];
  variableExpenses: ExpenseItem[];
  fixedTotal: number;
  variableTotal: number;
}
```

**Diseño**:
- Dos sub-tarjetas: "Gastos Mensuales Fijos" y "Gastos Variables del Mes"
- Cada una con su lista y total

### 6. SavingsSection

**Propósito**: Muestra métricas de ahorro con indicadores de progreso.

**Estructura de datos**:
```typescript
interface SavingsMetric {
  id: string;
  title: string;
  current: number;
  goal: number;
  savingsPercentage: number;
  goalPercentage: number;
}

interface SavingsSectionProps {
  emergencyFund: SavingsMetric;
  investmentCapital: SavingsMetric;
  totalSavings: number;
}
```

**Diseño**:
- Tarjetas verticales con fondo `#9CAB84` o variaciones
- Cada métrica muestra:
  - Título
  - Monto actual / Meta
  - Barra de progreso
  - Porcentajes

### 7. VariablesSection

**Propósito**: Muestra variables auxiliares del presupuesto.

**Estructura de datos**:
```typescript
interface Variable {
  id: string;
  name: string;
  value: number | string;
  type: 'currency' | 'percentage' | 'number';
}

interface VariablesSectionProps {
  variables: Variable[];
}
```

## Sistema de Diseño

### Tipografía

**Fuentes**: Geist Sans (principal), Geist Mono (números/código)

**Escala**:
- Títulos principales: `text-3xl` (30px) - `font-bold`
- Títulos de sección: `text-xl` (20px) - `font-semibold`
- Títulos de tarjeta: `text-lg` (18px) - `font-medium`
- Texto normal: `text-base` (16px) - `font-normal`
- Texto secundario: `text-sm` (14px) - `font-normal`
- Valores grandes: `text-4xl` (36px) - `font-bold` - Geist Mono
- Valores medianos: `text-2xl` (24px) - `font-semibold` - Geist Mono

### Espaciado

**Sistema de espaciado** (basado en Tailwind):
- Entre secciones principales: `gap-8` (32px)
- Entre tarjetas: `gap-6` (24px)
- Padding de tarjetas: `p-6` (24px)
- Entre elementos de lista: `gap-3` (12px)
- Margen interno de componentes: `space-y-4` (16px)

### Bordes y Sombras

**Bordes**:
- Radio de tarjetas: `rounded-xl` (12px)
- Radio de botones: `rounded-lg` (8px)
- Grosor de borde: `border` (1px)
- Color de borde: `border-sage/20` (sage con 20% opacidad)

**Sombras**:
- Tarjetas: `shadow-sm` - sutil
- Tarjetas hover: `shadow-md` - media
- Elementos destacados: `shadow-lg` - pronunciada

### Componentes UI Base

#### Card
```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'income' | 'expense' | 'savings';
  className?: string;
}
```

Estilos base:
- `rounded-xl`
- `p-6`
- `shadow-sm`
- `transition-shadow duration-200`
- `hover:shadow-md`

#### ProgressBar
```typescript
interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}
```

Estilos:
- Contenedor: `w-full bg-sage-dark/10 rounded-full`
- Barra: `bg-sage transition-all duration-300 rounded-full`
- Altura sm: `h-2`, md: `h-3`, lg: `h-4`

## Layout Responsivo

### Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm - lg)
- **Desktop**: > 1024px (lg+)

### Grid del Dashboard

**Desktop (lg+)**:
```
┌─────────────────────────────────────────────┐
│  Métricas (5 columnas)                      │
├──────────────────────────┬──────────────────┤
│  Ingresos                │                  │
│  ─────────               │   Ahorros        │
│  Gastos Fijos            │                  │
│  ─────────               │                  │
│  Gastos Variables        │                  │
├──────────────────────────┴──────────────────┤
│  Variables                                  │
└─────────────────────────────────────────────┘
```

**Tablet (md - lg)**:
```
┌─────────────────────────────────────────────┐
│  Métricas (2-3 columnas)                    │
├─────────────────────────────────────────────┤
│  Ingresos                                   │
├─────────────────────────────────────────────┤
│  Gastos Fijos                               │
├─────────────────────────────────────────────┤
│  Gastos Variables                           │
├─────────────────────────────────────────────┤
│  Ahorros                                    │
├─────────────────────────────────────────────┤
│  Variables                                  │
└─────────────────────────────────────────────┘
```

**Mobile (< sm)**:
```
┌───────────────────┐
│  Métrica 1        │
├───────────────────┤
│  Métrica 2        │
├───────────────────┤
│  ...              │
├───────────────────┤
│  Ingresos         │
├───────────────────┤
│  Gastos Fijos     │
├───────────────────┤
│  Gastos Variables │
├───────────────────┤
│  Ahorros          │
├───────────────────┤
│  Variables        │
└───────────────────┘
```

## Datos de Ejemplo

### Fuentes de Ingresos
```typescript
const incomeData: IncomeItem[] = [
  { id: '1', name: 'Salario (ENCU)', amount: 850.00 },
  { id: '2', name: 'Aguinaldo', amount: 100.00 },
  { id: '3', name: 'Bono', amount: 50.00 },
  { id: '4', name: 'Ingreso 1', amount: 200.00 },
  { id: '5', name: 'Otros', amount: 216.00 },
];
// Total: $1,416.00
```

### Gastos Mensuales Fijos
```typescript
const fixedExpenses: ExpenseItem[] = [
  { id: '1', name: 'Renta (Apartamento)', amount: 315.22 },
  { id: '2', name: 'Electricidad', amount: 25.00 },
  { id: '3', name: 'Internet', amount: 35.00 },
  { id: '4', name: 'Comida para la casa', amount: 110.00 },
  { id: '5', name: 'Donación', amount: 12.00 },
  { id: '6', name: 'Proyecciones para calefón', amount: 12.00 },
];
// Total: $509.22
```

### Gastos Variables
```typescript
const variableExpenses: ExpenseItem[] = [
  { id: '1', name: 'Herramientas para equipo de voleibol', amount: 67.00 },
  { id: '2', name: 'Pago al instructor de VB', amount: 8.00 },
];
// Total: $75.00
```

### Métricas de Ahorro
```typescript
const savingsData = {
  emergencyFund: {
    current: 0.00,
    goal: 167.09,
    savingsPercentage: 11.80,
    goalPercentage: 615.861,
  },
  investmentCapital: {
    current: 0.00,
    goal: 0.00,
    savingsPercentage: 0.00,
    goalPercentage: 0.00,
  },
  totalSavings: 0.00,
};
```

### Métricas Principales
```typescript
const mainMetrics = {
  totalIncome: 614.69,
  totalExpenses: 2265.66,
  incomeUsedPercentage: 43.41,
  fixedExpensesPercentage: 39.49,
  totalExpensesPercentage: 44.79,
};
```

## Interacciones y Estados

### Estados de Hover
- Tarjetas: Elevar sombra de `shadow-sm` a `shadow-md`
- Elementos de lista: Fondo con `bg-sage-dark/5`
- Transiciones: `transition-all duration-200`

### Estados de Carga
- Skeleton loaders con animación pulse
- Color base: `bg-sage-light/20`

### Formato de Números

**Moneda USD**:
```typescript
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
// Ejemplo: $1,416.00
```

**Porcentajes**:
```typescript
const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
// Ejemplo: 43.41%
```

## Accesibilidad

### Contraste
- Texto sobre `#F6F0D7`: usar `#89986D` o más oscuro (ratio mínimo 4.5:1)
- Texto sobre `#C5D89D`: usar `#89986D` o más oscuro
- Texto sobre `#9CAB84`: usar blanco o muy oscuro

### Semántica HTML
- Usar elementos semánticos: `<main>`, `<section>`, `<article>`
- Headings jerárquicos: `h1` para título principal, `h2` para secciones
- Listas con `<ul>` y `<li>` para items

### ARIA Labels
- Barras de progreso: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Métricas: `aria-label` descriptivo

## Configuración de Tailwind

### Extensión de Colores
```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      cream: '#F6F0D7',
      sage: {
        light: '#C5D89D',
        DEFAULT: '#9CAB84',
        dark: '#89986D',
      },
    },
  },
}
```

## Próximos Pasos

1. Implementar componentes base (Card, ProgressBar, Typography)
2. Crear componentes de sección (IncomeSection, ExpensesSection, etc.)
3. Ensamblar dashboard principal
4. Implementar responsividad
5. Agregar interacciones y transiciones
6. Pruebas de accesibilidad y contraste
