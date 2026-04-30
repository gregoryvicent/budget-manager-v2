import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/Providers/SessionProvider";
import { AlertProvider } from "@/contexts/AlertContext";
import { CacheProvider } from "@/contexts/CacheContext";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mubu - Gestor de Presupuestos",
  description:
    "Aplicación web para gestionar presupuestos personales u organizacionales con una interfaz visual clara y minimalista.",
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mubu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/png" href="/mubu_icon_03.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/media/photos/ios/180.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegistrar />
        <SessionProvider>
          <AlertProvider>
            <CacheProvider>{children}</CacheProvider>
          </AlertProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
