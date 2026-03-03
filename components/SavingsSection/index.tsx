"use client";

import EditableMetricCard from "@/components/EditableMetricCard";

/**
 * Represents a savings metric with current amount, goal, and percentages.
 */
export interface SavingsMetric {
  /** Unique identifier for the savings metric */
  id: string;
  /** Title/name of the savings metric */
  title: string;
  /** Current amount saved in USD */
  current: number;
  /** Goal amount in USD */
  goal: number;
  /** Percentage of income allocated to this savings */
  savingsPercentage: number;
  /** Percentage of goal achieved */
  goalPercentage: number;
}

/**
 * Props for the SavingsSection component.
 */
interface SavingsSectionProps {
  /** Emergency fund savings metric */
  emergencyFund: SavingsMetric;
  /** Investment capital savings metric */
  investmentCapital: SavingsMetric;
  /** Total savings amount in USD */
  totalSavings: number;
  /** Total income for percentage calculations */
  totalIncome: number;
  /** Callback when emergency fund amount changes */
  onEmergencyFundAmountChange: (amount: number) => void;
  /** Callback when emergency fund percentage changes */
  onEmergencyFundPercentageChange: (percentage: number) => void;
  /** Callback when investment capital amount changes */
  onInvestmentCapitalAmountChange: (amount: number) => void;
  /** Callback when investment capital percentage changes */
  onInvestmentCapitalPercentageChange: (percentage: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Section component for displaying savings metrics.
 * Shows emergency fund, investment capital, and total savings.
 * Each metric displays current/goal amounts, percentages, and progress bars.
 * Uses Card with savings variant for visual distinction.
 * Allows bidirectional editing: changing amount updates percentage and vice versa.
 *
 * @param {SavingsSectionProps} props - The component props
 * @returns {JSX.Element} The rendered savings section
 * @example
 * <SavingsSection
 *   emergencyFund={{
 *     id: '1',
 *     title: 'Fondo de Emergencia',
 *     current: 0,
 *     goal: 167.09,
 *     savingsPercentage: 11.80,
 *     goalPercentage: 0
 *   }}
 *   investmentCapital={{
 *     id: '2',
 *     title: 'Capital de Inversión',
 *     current: 0,
 *     goal: 0,
 *     savingsPercentage: 0,
 *     goalPercentage: 0
 *   }}
 *   totalSavings={0}
 *   totalIncome={1416}
 *   onEmergencyFundAmountChange={(amount) => handleAmountChange(amount)}
 *   onEmergencyFundPercentageChange={(percentage) => handlePercentageChange(percentage)}
 *   onInvestmentCapitalAmountChange={(amount) => handleAmountChange(amount)}
 *   onInvestmentCapitalPercentageChange={(percentage) => handlePercentageChange(percentage)}
 * />
 */
export default function SavingsSection({
  emergencyFund,
  investmentCapital,
  totalSavings,
  totalIncome,
  onEmergencyFundAmountChange,
  onEmergencyFundPercentageChange,
  onInvestmentCapitalAmountChange,
  onInvestmentCapitalPercentageChange,
  className = "",
}: SavingsSectionProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Left side: Emergency Fund - 2 cards side by side */}
      <div className="grid grid-cols-2 gap-4">
        <EditableMetricCard
          label="Monto a ahorrar"
          value={emergencyFund.current}
          isPercentage={false}
          onChange={onEmergencyFundAmountChange}
        />

        <EditableMetricCard
          label="Porcentaje a Ahorrar"
          value={emergencyFund.savingsPercentage}
          isPercentage={true}
          onChange={onEmergencyFundPercentageChange}
        />
      </div>

      {/* Right side: Investment Capital - 2 cards side by side */}
      <div className="grid grid-cols-2 gap-4">
        <EditableMetricCard
          label="Monto a Invertir"
          value={investmentCapital.current}
          isPercentage={false}
          onChange={onInvestmentCapitalAmountChange}
        />

        <EditableMetricCard
          label="Porcentaje a invertir"
          value={investmentCapital.savingsPercentage}
          isPercentage={true}
          onChange={onInvestmentCapitalPercentageChange}
        />
      </div>
    </div>
  );
}
