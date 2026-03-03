import type { ReactNode } from "react";

/**
 * Props for the Container component.
 */
interface ContainerProps {
  /** Content to be rendered inside the container */
  children: ReactNode;
  /** Additional CSS classes to apply to the container */
  className?: string;
}

/**
 * A responsive container component that centers content and applies consistent padding.
 * Adapts to different screen sizes with appropriate max-width and spacing.
 *
 * @param {ContainerProps} props - The component props
 * @returns {JSX.Element} The rendered container component
 * @example
 * <Container>
 *   <h1>Dashboard Content</h1>
 * </Container>
 */
export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`w-full mx-auto px-2 sm:px-3 lg:px-4 ${className}`}
    >
      {children}
    </div>
  );
}
