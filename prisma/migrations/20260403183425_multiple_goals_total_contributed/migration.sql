-- DropIndex
DROP INDEX "savings_goals_user_id_type_key";

-- AlterTable
ALTER TABLE "savings_goals" ADD COLUMN     "total_contributed" DECIMAL(10,2) NOT NULL DEFAULT 0;
