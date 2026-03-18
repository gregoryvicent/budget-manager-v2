-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('SAVINGS', 'INVESTMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_months" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_months_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "budget_month_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "budget_month_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "GoalType" NOT NULL,
    "title" TEXT NOT NULL,
    "goal_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_month_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "savings_goal_id" UUID NOT NULL,
    "budget_month_id" UUID NOT NULL,
    "allocation_pct" DECIMAL(5,2) NOT NULL,
    "amount_contributed" DECIMAL(10,2),

    CONSTRAINT "goal_month_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "budget_months_user_id_year_month_key" ON "budget_months"("user_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "savings_goals_user_id_type_key" ON "savings_goals"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "goal_month_settings_savings_goal_id_budget_month_id_key" ON "goal_month_settings"("savings_goal_id", "budget_month_id");

-- AddForeignKey
ALTER TABLE "budget_months" ADD CONSTRAINT "budget_months_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_entries" ADD CONSTRAINT "income_entries_budget_month_id_fkey" FOREIGN KEY ("budget_month_id") REFERENCES "budget_months"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_entries" ADD CONSTRAINT "expense_entries_budget_month_id_fkey" FOREIGN KEY ("budget_month_id") REFERENCES "budget_months"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_month_settings" ADD CONSTRAINT "goal_month_settings_savings_goal_id_fkey" FOREIGN KEY ("savings_goal_id") REFERENCES "savings_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_month_settings" ADD CONSTRAINT "goal_month_settings_budget_month_id_fkey" FOREIGN KEY ("budget_month_id") REFERENCES "budget_months"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
