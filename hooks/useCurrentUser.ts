"use client";

import { useSession } from "next-auth/react";

/**
 * Returns the authenticated user's ID from the NextAuth session.
 * Replaces the previous localStorage-based implementation.
 *
 * @returns {{ userId: string | null; loading: boolean }} User ID and loading state.
 */
export const useCurrentUser = () => {
    const { data: session, status } = useSession();

    const userId = session?.user?.id ?? null;
    const loading = status === "loading";

    return { userId, loading };
};
