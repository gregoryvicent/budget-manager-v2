import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/Providers/SessionProvider";
import { AlertProvider } from "@/contexts/AlertContext";
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
  title: "Budget Manager - Gestor de Presupuestos",
  description:
    "Aplicación web para gestionar presupuestos personales u organizacionales con una interfaz visual clara y minimalista.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <AlertProvider>{children}</AlertProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
