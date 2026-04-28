-- Backfill GoalMonthSettings for existing SavingsGoals based on their temporal range.
-- This migration MUST run BEFORE removing the start/archived columns from savings_goals.

-- Step 1: Create GoalMonthSettings for active (non-archived) goals.
-- These goals apply from their start date through all existing BudgetMonths.
INSERT INTO goal_month_settings (id, savings_goal_id, budget_month_id, allocation_pct, created_at, updated_at)
SELECT gen_random_uuid(), sg.id, bm.id, 0, NOW(), NOW()
FROM savings_goals sg
JOIN budget_months bm ON bm.user_id = sg.user_id
WHERE sg.archived_year IS NULL
  AND (bm.year > sg.start_year OR (bm.year = sg.start_year AND bm.month >= sg.start_month))
  AND NOT EXISTS (
    SELECT 1 FROM goal_month_settings gms
    WHERE gms.savings_goal_id = sg.id AND gms.budget_month_id = bm.id
  );

-- Step 2: Create GoalMonthSettings for archived goals.
-- These goals apply from start date up to (but not including) the archived date.
INSERT INTO goal_month_settings (id, savings_goal_id, budget_month_id, allocation_pct, created_at, updated_at)
SELECT gen_random_uuid(), sg.id, bm.id, 0, NOW(), NOW()
FROM savings_goals sg
JOIN budget_months bm ON bm.user_id = sg.user_id
WHERE sg.archived_year IS NOT NULL
  AND (bm.year > sg.start_year OR (bm.year = sg.start_year AND bm.month >= sg.start_month))
  AND (bm.year < sg.archived_year OR (bm.year = sg.archived_year AND bm.month < sg.archived_month))
  AND NOT EXISTS (
    SELECT 1 FROM goal_month_settings gms
    WHERE gms.savings_goal_id = sg.id AND gms.budget_month_id = bm.id
  );
