---
inclusion: always
---

# Code Style Guidelines

## Component Architecture

### Component Organization
- Place reusable components in `/components/[ComponentName]/index.tsx`
- Use PascalCase for component names and folders
- Default to Server Components (Next.js App Router)
- Add `"use client"` directive only when client-side features are required

### Component Design Principles
- Create generic, reusable components that can be used throughout the application
- Keep components focused on a single responsibility
- Extract complex logic into custom hooks
- Prefer composition over prop drilling

## Custom Hooks

### Hook Guidelines
- Extract complex logic from UI components into custom hooks
- Place hooks in `/hooks/[hookName].ts` or colocate with components
- Use `use` prefix for all custom hooks (e.g., `useAuth`, `useBudget`)
- Make hooks reusable and testable
- Document hook parameters and return values

## Documentation Standards

### Code Documentation
- Document all components, functions, and hooks using JSDoc/TSDoc
- Follow Google Style docstrings format
- Update documentation whenever code changes
- Include parameter types, return types, and usage examples

### Documentation Format
```typescript
/**
 * Brief description of the component/function.
 *
 * @param {Type} paramName - Description of parameter
 * @returns {Type} Description of return value
 * @example
 * <ComponentName prop="value" />
 */
```

## TypeScript Conventions

### Type Safety
- Use TypeScript strict mode (already enabled)
- Define explicit types for props, state, and function parameters
- Avoid `any` type; use `unknown` when type is truly unknown
- Use type inference where it improves readability
- Import types with `type` keyword: `import type { Metadata } from "next"`

### Naming Conventions
- Interfaces: PascalCase with descriptive names (e.g., `BudgetItem`, `UserProfile`)
- Types: PascalCase (e.g., `ButtonVariant`, `ThemeMode`)
- Enums: PascalCase for enum name, UPPER_CASE for values

## Styling Guidelines

### Tailwind CSS
- Use Tailwind utility classes for styling
- Follow mobile-first responsive design (use `sm:`, `md:`, `lg:` breakpoints)
- Support dark mode with `dark:` prefix
- Group related utilities logically (layout, spacing, colors, typography)
- Extract repeated utility combinations into reusable components

### Class Organization
Order Tailwind classes as: layout → spacing → sizing → colors → typography → effects

## Clean Architecture Principles

### Separation of Concerns
- Keep business logic separate from UI components
- Use custom hooks for data fetching and state management
- Create utility functions for reusable logic in `/lib` or `/utils`
- Separate API routes and server actions appropriately

### File Structure
- Colocate related files (component, styles, tests, types)
- Use barrel exports (`index.ts`) for cleaner imports
- Keep files focused and under 300 lines when possible

## Import Conventions

### Import Order
1. External dependencies (React, Next.js, third-party)
2. Internal absolute imports using `@/` alias
3. Relative imports
4. Type imports (use `import type` when possible)

### Path Aliases
- Use `@/` for imports from project root
- Example: `import { Button } from "@/components/Button"`

## Next.js Specific

### Optimization
- Use `next/image` for all images
- Use `next/font` for font optimization
- Implement proper metadata for SEO
- Leverage Server Components for data fetching when possible

### Routing
- Follow App Router conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Use Server Actions for form submissions and mutations
- Implement proper error boundaries