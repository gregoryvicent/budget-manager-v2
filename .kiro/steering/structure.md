# Project Structure

## Architecture Pattern
This project uses the **Next.js App Router** architecture with file-based routing.

## Directory Organization

### `/app`
Main application directory using App Router conventions:
- `layout.tsx` - Root layout with font configuration and metadata
- `page.tsx` - Home page component
- `globals.css` - Global styles and Tailwind directives
- `favicon.ico` - Site favicon

### `/public`
Static assets served from root URL:
- SVG icons and images
- Publicly accessible files

### Configuration Files (Root)
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript compiler options
- `eslint.config.mjs` - ESLint rules and settings
- `postcss.config.mjs` - PostCSS/Tailwind configuration
- `package.json` - Dependencies and scripts

## Conventions

### File Naming
- React components: PascalCase with `.tsx` extension
- Configuration files: kebab-case with appropriate extension
- Use TypeScript for all new files

### Component Structure
- Server Components by default (Next.js 13+ App Router)
- Use `"use client"` directive only when client-side features needed
- Export default for page and layout components

### Styling
- Use Tailwind utility classes
- Support dark mode with `dark:` prefix
- Responsive design with mobile-first approach (sm:, md:, etc.)

### Imports
- Use `@/` path alias for imports from project root
- Use Next.js optimized components (`next/image`, `next/font`, etc.)
- Import types with `type` keyword when possible

### Routing
- File-based routing in `/app` directory
- `page.tsx` creates routes
- `layout.tsx` wraps child routes
- Use Server Components for data fetching when possible
