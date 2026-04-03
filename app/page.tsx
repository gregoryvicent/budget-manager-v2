"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Public landing page for Budget Manager.
 * Shows app description and navigation links to login/register.
 * Redirects authenticated users to the dashboard.
 */
export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/user/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated" || status === "loading") return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0f1e] px-4 text-center">
      <h1 className="mb-3 text-4xl font-bold tracking-tight text-[#f9fafb]">
        Budget Manager
      </h1>
      <p className="mb-8 max-w-md text-lg text-[#cbd5e1]">
        Track your income, expenses, and savings goals with a clear, visual dashboard.
        Take control of your finances.
      </p>

      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="rounded-lg border border-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-[#3b82f6] transition-colors hover:bg-[#3b82f6]/10"
        >
          Log In
        </Link>
        <Link
          href="/auth/register"
          className="rounded-lg bg-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
