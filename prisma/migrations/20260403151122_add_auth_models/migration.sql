-- DropForeignKey
ALTER TABLE "budget_months" DROP CONSTRAINT "budget_months_user_id_fkey";

-- DropForeignKey
ALTER TABLE "expense_entries" DROP CONSTRAINT "expense_entries_budget_month_id_fkey";

-- DropForeignKey
ALTER TABLE "goal_month_settings" DROP CONSTRAINT "goal_month_settings_budget_month_id_fkey";

-- DropForeignKey
ALTER TABLE "goal_month_settings" DROP CONSTRAINT "goal_month_settings_savings_goal_id_fkey";

-- DropForeignKey
ALTER TABLE "income_entries" DROP CONSTRAINT "income_entries_budget_month_id_fkey";

-- DropForeignKey
ALTER TABLE "savings_goals" DROP CONSTRAINT "savings_goals_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_hash" TEXT;

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "budget_months" ADD CONSTRAINT "budget_months_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_entries" ADD CONSTRAINT "income_entries_budget_month_id_fkey" FOREIGN KEY ("budget_month_id") REFERENCES "budget_months"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_entries" ADD CONSTRAINT "expense_entries_budget_month_id_fkey" FOREIGN KEY ("budget_month_id") REFERENCES "budget_months"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_month_settings" ADD CONSTRAINT "goal_month_settings_savings_goal_id_fkey" FOREIGN KEY ("savings_goal_id") REFERENCES "savings_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_month_settings" ADD CONSTRAINT "goal_month_settings_budget_month_id_fkey" FOREIGN KEY ("budget_month_id") REFERENCES "budget_months"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
