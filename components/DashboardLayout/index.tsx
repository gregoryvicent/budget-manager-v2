import type { ReactNode } from "react";
import Container from "@/components/Container";
import Header from "@/components/Header";

/**
 * Props for the DashboardLayout component.
 */
interface DashboardLayoutProps {
  /** Content to be rendered inside the dashboard layout */
  children: ReactNode;
  /** Additional CSS classes to apply to the layout */
  className?: string;
}

/**
 * Main layout component for the dashboard.
 * Provides a consistent structure with sage-light background and proper spacing.
 * Uses the Container component for responsive width and padding.
 *
 * @param {DashboardLayoutProps} props - The component props
 * @returns {JSX.Element} The rendered dashboard layout
 * @example
 * <DashboardLayout>
 *   <MetricsGrid />
 *   <IncomeSection />
 * </DashboardLayout>
 */
export default function DashboardLayout({
  children,
  className = "",
}: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen bg-sage-light dark:bg-charcoal ${className}`}>
      <Header />
      <Container className="py-4 space-y-4">
        {children}
      </Container>
    </div>
  );
}
