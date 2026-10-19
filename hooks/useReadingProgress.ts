import { useCallback, useEffect, useMemo, useState } from "react";
import authStore from "@/store/authStore";
import readingStore from "@/store/readingStore";
import { readingProgressSchema } from "@/schema/reading.schema";
import { buildProgressKey } from "@/utils/readingProgress";
import { ReadingPosition } from "@/types/reading.types";

/**
 * Lee y guarda el progreso de lectura del usuario logueado en un libro.
 * @param bookId : id del libro (ver buildBookId)
 * @returns progress : punto guardado, o undefined si todavia no empezo el libro
 * @returns isReady : false mientras se recupera lo guardado en el dispositivo
 * @returns savePosition : guarda capitulo + scroll actuales
 */
export const useReadingProgress = (bookId: string) => {
    const userId = authStore((state) => state.public_id)
    const progressKey = buildProgressKey(userId, bookId)

    const storedProgress = readingStore((state) => state.progressByKey[progressKey])
    const setProgress = readingStore((state) => state.setProgress)

    // Sin esperar la rehidratacion, un usuario que ya leyo veria "Comenzar a leer" por un instante
    const [isReady, setIsReady] = useState(readingStore.persist.hasHydrated())

    useEffect(() => {
        if (readingStore.persist.hasHydrated()) {
            setIsReady(true)
            return
        }
        return readingStore.persist.onFinishHydration(() => setIsReady(true))
    }, [])

    // Si lo guardado esta corrupto se ignora y se trata como libro sin empezar
    const progress = useMemo(() => {
        if (!storedProgress) return undefined
        const result = readingProgressSchema.safeParse(storedProgress)
        return result.success ? result.data : undefined
    }, [storedProgress])

    const savePosition = useCallback((position: ReadingPosition) => {
        const result = readingProgressSchema.safeParse({
            bookId,
            ...position,
            updatedAt: new Date().toISOString()
        })

        if (!result.success) {
            console.warn("Progreso de lectura inválido, no se guarda:", result.error.message)
            return
        }

        setProgress(progressKey, result.data)
    }, [bookId, progressKey, setProgress])

    return { progress, isReady, savePosition }
}
