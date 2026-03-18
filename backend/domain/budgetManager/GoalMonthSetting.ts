export interface GoalMonthSetting {
  id: string;
  savingsGoalId: string;
  budgetMonthId: string;
  allocationPct: number;
  /** Importe real aportado al cerrar el mes. null = mes aún abierto. */
  amountContributed: number | null;
  createdAt: Date;
  updatedAt: Date;
}
