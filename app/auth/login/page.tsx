"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Zod schema for login form validation.
 * - email: required, valid format
 * - password: required
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio.")
    .email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login page component.
 * Allows registered users to sign in with email and password.
 * Uses react-hook-form + zod for validation.
 * Redirects to dashboard if already authenticated.
 */
export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/user/dashboard");
    }
  }, [status, router]);

  async function onSubmit(data: LoginFormData) {
    setGeneralError(null);
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Generic message — never reveal whether the email exists
        setGeneralError("Correo o contraseña incorrectos.");
        return;
      }

      router.push("/user/dashboard");
    } catch {
      setGeneralError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return null;

  const inputClass =
    "w-full rounded-lg border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-sm text-[#f9fafb] placeholder-[#6b7280] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]";
  const errorClass = "mt-1 text-xs text-red-400";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#111827] p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#f9fafb]">
          Iniciar Sesión
        </h1>

        {generalError && (
          <p
            className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
            role="alert"
          >
            {generalError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#cbd5e1]">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={inputClass}
              placeholder="tu@ejemplo.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className={errorClass}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#cbd5e1]">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className={inputClass}
              placeholder="Tu contraseña"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className={errorClass}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#3b82f6] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb] disabled:opacity-50"
          >
            {submitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-[#3b82f6] hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
