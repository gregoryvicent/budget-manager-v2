"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "budget_userId";

// TODO: reemplazar por autenticación real cuando se implemente la gestión de usuarios.
const DEFAULT_USER_ID = "c61d747f-f498-4e94-83b4-82387a3ad95c";

/**
 * Gestiona la identidad del usuario actual usando localStorage.
 * Crea el usuario en el backend si no existe y lo persiste localmente.
 *
 * @returns Estado del usuario y función para crear uno nuevo.
 */
export const useCurrentUser = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_USER_ID;
        setUserId(stored);
        setLoading(false);
    }, []);

    const createUser = async (name: string, email: string): Promise<void> => {
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al crear usuario.");

        localStorage.setItem(STORAGE_KEY, data.id);
        setUserId(data.id);
    };

    return { userId, loading, createUser };
};
