/*
  Warnings:

  - Added the required column `updated_at` to the `budget_months` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `expense_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `goal_month_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `income_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `savings_goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "budget_months" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "expense_entries" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "goal_month_settings" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "income_entries" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "savings_goals" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
