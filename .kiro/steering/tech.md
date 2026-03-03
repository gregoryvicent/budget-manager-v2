# Technology Stack

## Core Framework
- **Next.js 16.1.2** (App Router)
- **React 19.2.3** with React DOM 19.2.3
- **TypeScript 5** (strict mode enabled)

## Styling
- **Tailwind CSS 4** with PostCSS
- Dark mode support via Tailwind
- Geist font family (sans and mono variants)

## Build System
- Next.js built-in bundler
- TypeScript compiler with strict settings
- ESLint with Next.js config (core-web-vitals + TypeScript rules)

## TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- Path aliases: `@/*` maps to project root
- Module resolution: bundler
- JSX: react-jsx

## Common Commands

### Development
```bash
npm run dev
```
Starts the development server at http://localhost:3000 with hot reload.

### Build
```bash
npm run build
```
Creates an optimized production build.

### Production
```bash
npm run start
```
Runs the production server (requires build first).

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality and style.

## Code Quality
- ESLint configured with Next.js recommended rules
- TypeScript strict mode enforced
- Core Web Vitals monitoring enabled
