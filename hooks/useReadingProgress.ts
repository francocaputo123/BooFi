import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import authStore from "@/store/authStore";
import readingStore from "@/store/readingStore";
import { readingProgressSchema } from "@/schema/reading.schema";
import { fetchRemoteProgress, saveRemoteProgress } from "@/services/readingProgressService";
import { REMOTE_SAVE_DELAY_MS, REMOTE_SYNC_TIMEOUT_MS } from "@/data/readingData";
import { buildProgressKey } from "@/utils/readingProgress";
import { withTimeout } from "@/utils/withTimeout";
import { ReadingPosition, ReadingProgress } from "@/types/reading.types";

// updatedAt es una fecha ISO: se compara como fecha, no como texto
const isNewer = (candidate: ReadingProgress, reference: ReadingProgress): boolean => {
    return Date.parse(candidate.updatedAt) > Date.parse(reference.updatedAt)
}

/**
 * Lee y guarda el progreso de lectura del usuario logueado en un libro.
 * Siempre se guarda en el dispositivo; si el libro está publicado ("shouldSync"),
 * también en Firestore, para retomar la lectura desde cualquier dispositivo.
 * @param bookId : id del libro (ver buildBookId)
 * @param shouldSync : true para libros publicados; los locales (EPUB o borrador) no existen en otro dispositivo
 * @returns progress : punto guardado, o undefined si todavia no empezo el libro
 * @returns isReady : false mientras se recupera lo guardado (dispositivo y, si corresponde, nube)
 * @returns savePosition : guarda capitulo + scroll actuales
 */
export const useReadingProgress = (bookId: string, shouldSync: boolean = false) => {
    const userId = authStore((state) => state.public_id)
    const progressKey = buildProgressKey(userId, bookId)
    const canSync = shouldSync && userId !== "" && bookId !== ""

    const storedProgress = readingStore((state) => state.progressByKey[progressKey])
    const setProgress = readingStore((state) => state.setProgress)

    // Sin esperar la rehidratacion, un usuario que ya leyo veria "Comenzar a leer" por un instante
    const [isHydrated, setIsHydrated] = useState(readingStore.persist.hasHydrated())
    // Clave del progreso que ya se comparó con la nube (evita repetir la consulta en cada render)
    const [syncedKey, setSyncedKey] = useState("")

    // Último punto que se sabe guardado en la nube: sirve para no escribir lo mismo dos veces
    const lastSyncedRef = useRef<ReadingPosition | null>(null)
    const pendingRemoteRef = useRef<ReadingProgress | null>(null)
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (readingStore.persist.hasHydrated()) {
            setIsHydrated(true)
            return
        }
        return readingStore.persist.onFinishHydration(() => setIsHydrated(true))
    }, [])

    // Si la escritura falla (sin red, por ejemplo) no se pierde nada: queda en el dispositivo
    // y se reintenta en el próximo guardado
    const flushRemote = useCallback(async () => {
        saveTimerRef.current = null
        const pending = pendingRemoteRef.current
        if (!pending || !userId) return

        pendingRemoteRef.current = null
        try {
            await saveRemoteProgress(userId, pending)
            lastSyncedRef.current = {
                chapterIndex: pending.chapterIndex,
                scrollOffset: pending.scrollOffset,
            }
        } catch (error) {
            console.warn("No se pudo guardar el progreso en la nube:", error)
        }
    }, [userId])

    // Al abrir un libro publicado se compara lo local con lo de la nube y gana lo más nuevo.
    // Hasta que termine, isReady es false: si el lector abriera antes, guardaría su punto local
    // con fecha de hoy y pisaría el avance hecho en otro dispositivo.
    useEffect(() => {
        if (!canSync || !isHydrated || syncedKey === progressKey) return

        let isCancelled = false

        const syncWithCloud = async () => {
            try {
                const remote = await withTimeout(fetchRemoteProgress(userId, bookId), REMOTE_SYNC_TIMEOUT_MS)
                if (isCancelled) return

                const local = readingStore.getState().progressByKey[progressKey]

                if (remote && (!local || isNewer(remote, local))) {
                    setProgress(progressKey, remote)
                    lastSyncedRef.current = {
                        chapterIndex: remote.chapterIndex,
                        scrollOffset: remote.scrollOffset,
                    }
                } else if (local && (!remote || isNewer(local, remote))) {
                    // Lo local es más nuevo (se leyó sin conexión): se sube a la nube
                    pendingRemoteRef.current = local
                    await flushRemote()
                }
            } catch (error) {
                // Sin red o con la nube lenta se sigue con lo del dispositivo
                console.warn("No se pudo recuperar el progreso de la nube:", error)
            } finally {
                if (!isCancelled) setSyncedKey(progressKey)
            }
        }

        syncWithCloud()

        return () => {
            isCancelled = true
        }
    }, [canSync, isHydrated, syncedKey, progressKey, userId, bookId, setProgress, flushRemote])

    const isReady = isHydrated && (!canSync || syncedKey === progressKey)

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

        // El dispositivo siempre guarda al instante
        setProgress(progressKey, result.data)

        if (!canSync) return

        const lastSynced = lastSyncedRef.current
        const isSamePoint =
            lastSynced !== null &&
            lastSynced.chapterIndex === result.data.chapterIndex &&
            lastSynced.scrollOffset === result.data.scrollOffset
        if (isSamePoint) return

        pendingRemoteRef.current = result.data

        // Cambiar de capítulo es el dato que más importa: se sube enseguida.
        // El scroll dentro del mismo capítulo se junta y se sube de a ratos, para no escribir en cada frenada.
        const hasChangedChapter = lastSynced === null || lastSynced.chapterIndex !== result.data.chapterIndex
        if (hasChangedChapter) {
            if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current)
            flushRemote()
            return
        }

        // NOTE: el timer no se cancela al salir de la pantalla a propósito: así lo último leído también llega a la nube
        if (saveTimerRef.current === null) {
            saveTimerRef.current = setTimeout(flushRemote, REMOTE_SAVE_DELAY_MS)
        }
    }, [bookId, progressKey, canSync, setProgress, flushRemote])

    return { progress, isReady, savePosition }
}
