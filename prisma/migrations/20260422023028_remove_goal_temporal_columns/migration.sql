-- Remove temporal range columns from savings_goals.
-- The backfill migration (20260422023027) must have run first.
ALTER TABLE "savings_goals" DROP COLUMN "start_year";
ALTER TABLE "savings_goals" DROP COLUMN "start_month";
ALTER TABLE "savings_goals" DROP COLUMN "archived_year";
ALTER TABLE "savings_goals" DROP COLUMN "archived_month";
