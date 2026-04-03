"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Registration page component.
 * Allows new users to create an account with name, email, and password.
 * Redirects to dashboard if already authenticated.
 */
export default function RegisterPage() {
  const { status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/user/dashboard");
    }
  }, [status, router]);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setGeneralError(data.error ?? "Registration failed.");
        return;
      }

      // Auto-login after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setGeneralError("Account created but auto-login failed. Please log in.");
        return;
      }

      router.push("/user/dashboard");
    } catch {
      setGeneralError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#111827] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#f9fafb]">
          Create Account
        </h1>

        {generalError && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400" role="alert">
            {generalError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#cbd5e1]">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-sm text-[#f9fafb] placeholder-[#6b7280] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
              placeholder="Your name"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>
            )}
          </div>

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
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
            )}
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
              placeholder="At least 8 characters"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            {fieldErrors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#3b82f6] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb] disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#3b82f6] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
