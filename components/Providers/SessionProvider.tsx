"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * Client-side wrapper for NextAuth SessionProvider.
 * Provides session context to all child components.
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} SessionProvider wrapper
 */
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
