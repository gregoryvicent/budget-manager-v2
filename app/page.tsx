"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

/** Data shape for each feature card displayed in the Features section. */
interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/** Static feature cards rendered in the landing page grid. */
const FEATURES: FeatureCard[] = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-savings"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: "Presupuestos Mensuales",
    description:
      "Crea y gestiona presupuestos para cada mes. Organiza tus finanzas de forma clara y estructurada.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-savings"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M23 6l-9.5 9.5-5-5L1 18" />
        <path d="M17 6h6v6" />
      </svg>
    ),
    title: "Seguimiento de Ingresos",
    description:
      "Registra todas tus fuentes de ingreso. Visualiza cuánto dinero entra cada mes.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-savings"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    title: "Gastos Fijos y Variables",
    description:
      "Categoriza tus gastos en fijos y variables. Identifica dónde va tu dinero.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-savings"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    title: "Metas de Ahorro",
    description:
      "Define metas de ahorro y haz seguimiento de tu progreso hacia cada objetivo.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-savings"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="2" y="13" width="4" height="8" rx="1" />
        <rect x="10" y="9" width="4" height="12" rx="1" />
        <rect x="18" y="5" width="4" height="16" rx="1" />
      </svg>
    ),
    title: "Dashboard Visual",
    description:
      "Visualiza tus finanzas con gráficos y métricas claras en un panel intuitivo.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-savings"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Historial de Presupuestos",
    description:
      "Consulta y compara tus presupuestos anteriores. Aprende de tus patrones financieros.",
  },
];

/**
 * Public landing page for Budget Manager.
 * Shows a full landing page with sticky header, hero section,
 * features section, and footer.
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
    <div className="min-h-screen bg-bg">
      {/* Sticky header with navigation */}
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-text text-lg">
            Gestor de Presupuestos
          </span>
          <nav className="flex items-center gap-2 md:gap-4">
            <Link
              href="/auth/login"
              className="text-text-dim hover:text-text transition-colors min-h-[44px] flex items-center px-3"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="bg-[#2563eb] text-white rounded-lg px-4 min-h-[44px] flex items-center font-semibold hover:bg-[#1d4ed8] transition-colors"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero section placeholder */}
        <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-text tracking-tight mb-6">
              Toma el control de tus finanzas
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-text-dim max-w-2xl mx-auto mb-10">
              Crea presupuestos mensuales, controla tus ingresos y gastos, y alcanza tus metas de ahorro con un panel visual y claro.
            </p>
            <div className="flex flex-col w-full md:flex-row md:w-auto md:justify-center gap-4">
              <Link
                href="/auth/register"
                className="flex items-center justify-center rounded-lg bg-[#2563eb] px-8 py-3 min-h-[44px] text-base font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
              >
                Comenzar Gratis
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center justify-center rounded-lg border border-savings px-8 py-3 min-h-[44px] text-base font-semibold text-savings transition-colors hover:bg-savings/10"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>

          {/* Dashboard screenshot mockup */}
          <div className="mt-16 md:mt-20 max-w-5xl mx-auto">
            <div className="relative rounded-xl md:rounded-2xl border border-card-border overflow-hidden shadow-[0_0_60px_-15px_rgba(37,99,235,0.3)]">
              <Image
                src="/media/photos/2026-04-29_18-34.png"
                alt="Vista del dashboard de Gestor de Presupuestos mostrando ingresos, gastos y metas de ahorro"
                width={1920}
                height={960}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-text text-center mb-12">
              Todo lo que necesitas para gestionar tu presupuesto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-card-border bg-card p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-savings/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-dim leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted text-sm">
            Gestor de Presupuestos © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
