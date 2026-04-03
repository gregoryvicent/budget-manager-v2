"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Login page component.
 * Allows registered users to sign in with email and password.
 * Redirects to dashboard if already authenticated.
 */
export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/user/dashboard");
    }
  }, [status, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Generic message — never reveal whether the email exists
        setError("Invalid email or password.");
        return;
      }

      router.push("/user/dashboard");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#111827] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#f9fafb]">
          Log In
        </h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#cbd5e1]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-sm text-[#f9fafb] placeholder-[#6b7280] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#cbd5e1]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-sm text-[#f9fafb] placeholder-[#6b7280] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#3b82f6] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb] disabled:opacity-50"
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#3b82f6] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
