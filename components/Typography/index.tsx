import type { ReactNode } from "react";

/**
 * Props for the Heading component.
 */
interface HeadingProps {
  /** Content to be rendered */
  children: ReactNode;
  /** Heading level (h1, h2, or h3) */
  level?: 1 | 2 | 3;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A heading component with predefined styles for different levels.
 *
 * @param {HeadingProps} props - The component props
 * @returns {JSX.Element} The rendered heading
 * @example
 * <Heading level={1}>Main Title</Heading>
 * <Heading level={2}>Section Title</Heading>
 */
export function Heading({ children, level = 2, className = "" }: HeadingProps) {
  const baseStyles = "text-charcoal font-semibold";
  
  const levelStyles = {
    1: "text-3xl font-bold",
    2: "text-xl",
    3: "text-lg font-medium",
  };

  const combinedClassName = `${baseStyles} ${levelStyles[level]} ${className}`;
  
  if (level === 1) {
    return <h1 className={combinedClassName}>{children}</h1>;
  }
  
  if (level === 3) {
    return <h3 className={combinedClassName}>{children}</h3>;
  }
  
  return <h2 className={combinedClassName}>{children}</h2>;
}

/**
 * Props for the Text component.
 */
interface TextProps {
  /** Content to be rendered */
  children: ReactNode;
  /** Text size variant */
  size?: "base" | "sm" | "lg";
  /** Additional CSS classes */
  className?: string;
}

/**
 * A text component for paragraphs and normal text.
 *
 * @param {TextProps} props - The component props
 * @returns {JSX.Element} The rendered text
 * @example
 * <Text>This is normal text</Text>
 * <Text size="sm">This is small text</Text>
 */
export function Text({ children, size = "base", className = "" }: TextProps) {
  const sizeStyles = {
    base: "text-base",
    sm: "text-sm",
    lg: "text-lg",
  };

  return (
    <p className={`text-charcoal ${sizeStyles[size]} ${className}`}>
      {children}
    </p>
  );
}

/**
 * Props for the Label component.
 */
interface LabelProps {
  /** Content to be rendered */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A label component for small text labels.
 *
 * @param {LabelProps} props - The component props
 * @returns {JSX.Element} The rendered label
 * @example
 * <Label>Category Name</Label>
 */
export function Label({ children, className = "" }: LabelProps) {
  return (
    <span className={`text-sm text-charcoal font-normal ${className}`}>
      {children}
    </span>
  );
}

/**
 * Props for the Value component.
 */
interface ValueProps {
  /** Content to be rendered */
  children: ReactNode;
  /** Value size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
}

/**
 * A value component for displaying numeric values using Geist Mono font.
 *
 * @param {ValueProps} props - The component props
 * @returns {JSX.Element} The rendered value
 * @example
 * <Value size="lg">$1,416.00</Value>
 * <Value size="md">43.41%</Value>
 */
export function Value({ children, size = "md", className = "" }: ValueProps) {
  const sizeStyles = {
    sm: "text-base",
    md: "text-2xl font-semibold",
    lg: "text-4xl font-bold",
    xl: "text-5xl font-bold",
  };

  return (
    <span className={`font-mono text-charcoal ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}
