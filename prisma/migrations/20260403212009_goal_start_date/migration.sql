-- AlterTable: add start_year and start_month with defaults from created_at
ALTER TABLE "savings_goals"
ADD COLUMN "start_year" INTEGER,
ADD COLUMN "start_month" INTEGER;

-- Backfill existing rows from created_at
UPDATE "savings_goals"
SET "start_year" = EXTRACT(YEAR FROM "created_at")::INTEGER,
    "start_month" = EXTRACT(MONTH FROM "created_at")::INTEGER;

-- Now make them NOT NULL
ALTER TABLE "savings_goals"
ALTER COLUMN "start_year" SET NOT NULL,
ALTER COLUMN "start_month" SET NOT NULL;
