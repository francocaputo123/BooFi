import { useEffect, useState } from "react";

import authStore from "@/store/authStore";

// Tiempo máximo de espera por si AsyncStorage falla y la sesión nunca termina de leerse.
// Pasado ese tiempo seguimos igual para que el splash no quede trabado para siempre.
const HYDRATION_TIMEOUT_MS = 5000;

/**
 * Devuelve `true` cuando zustand terminó de leer la sesión guardada en AsyncStorage.
 * Hasta ese momento `isAuthenticated` puede figurar como `false` aunque el usuario esté logueado.
 */
const useAuthHydrated = () => {
    const [hydrated, setHydrated] = useState<boolean>(authStore.persist.hasHydrated());

    useEffect(() => {
        // Por si terminó de hidratarse entre el primer render y este efecto
        setHydrated(authStore.persist.hasHydrated());

        const unsubscribe = authStore.persist.onFinishHydration(() => setHydrated(true));
        const timeout = setTimeout(() => setHydrated(true), HYDRATION_TIMEOUT_MS);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    return hydrated;
};

export default useAuthHydrated;
