import { useCallback, useMemo, useState } from "react"
import { useFocusEffect } from "expo-router"
import authStore from "@/store/authStore"
import readingStore from "@/store/readingStore"
import { readingProgressSchema } from "@/schema/reading.schema"
import { fetchAllRemoteProgress } from "@/services/readingProgressService"
import { HOME_CONTINUE_LIMIT } from "@/data/catalogData"
import { REMOTE_SYNC_TIMEOUT_MS } from "@/data/readingData"
import { clampChapterIndex } from "@/utils/chapterNavigation"
import { buildProgressKey, getReadingPercent } from "@/utils/readingProgress"
import { withTimeout } from "@/utils/withTimeout"
import { CatalogBook } from "@/types/catalog.types"
import { ContinueReadingItem, ReadingProgress } from "@/types/reading.types"

// updatedAt es una fecha ISO: se compara como fecha, no como texto
const isNewer = (candidate: ReadingProgress, reference: ReadingProgress): boolean => {
    return Date.parse(candidate.updatedAt) > Date.parse(reference.updatedAt)
}

/**
 * Arma la lista "Seguir leyendo" del Home: los libros publicados que el usuario abrio con
 * "Comenzar a leer" (abrir solo la ficha no cuenta), del mas reciente al mas viejo.
 * Junta el progreso del dispositivo con el de la nube, asi aparecen tambien los libros
 * que empezo en otro celular con la misma cuenta; si un libro esta en los dos, gana el mas nuevo.
 * @param books : catalogo ya bajado (de ahi salen titulo, portada y cantidad de capitulos)
 * @returns continueBooks : libros en lectura con su porcentaje
 */
export const useContinueReading = (books: CatalogBook[]) => {
    const userId = authStore((state) => state.public_id)
    const progressByKey = readingStore((state) => state.progressByKey)
    const [remoteProgress, setRemoteProgress] = useState<ReadingProgress[]>([])

    // Se vuelve a pedir cada vez que se entra al Home, para ver lo ultimo que se leyo
    useFocusEffect(
        useCallback(() => {
            setRemoteProgress([])
            if (!userId) return

            let isCancelled = false
            withTimeout(fetchAllRemoteProgress(userId), REMOTE_SYNC_TIMEOUT_MS)
                .then((list) => {
                    if (!isCancelled) setRemoteProgress(list)
                })
                // Sin red se sigue mostrando lo que hay en el dispositivo
                .catch((error) => console.warn("No se pudo traer el progreso de la nube:", error))

            return () => {
                isCancelled = true
            }
        }, [userId])
    )

    const continueBooks = useMemo<ContinueReadingItem[]>(() => {
        if (!userId) return []

        const latestByBook = new Map<string, ReadingProgress>()
        const consider = (progress: ReadingProgress) => {
            const current = latestByBook.get(progress.bookId)
            if (!current || isNewer(progress, current)) latestByBook.set(progress.bookId, progress)
        }

        remoteProgress.forEach(consider)

        // Las claves locales son "uid:bookId": solo se toman las del usuario logueado
        const userPrefix = buildProgressKey(userId, "")
        Object.entries(progressByKey).forEach(([key, stored]) => {
            if (!key.startsWith(userPrefix)) return
            const result = readingProgressSchema.safeParse(stored)
            if (result.success) consider(result.data)
        })

        const booksById = new Map(books.map((book) => [book.id, book]))
        const items: ContinueReadingItem[] = []

        latestByBook.forEach((progress, bookId) => {
            // Si no esta en el catalogo es un libro local (EPUB o borrador) o uno que ya no existe
            const book = booksById.get(bookId)
            if (!book) return

            items.push({
                book,
                progress,
                currentChapter: clampChapterIndex(progress.chapterIndex, book.chapterCount) + 1,
                percent: getReadingPercent(progress.chapterIndex, book.chapterCount),
            })
        })

        items.sort((a, b) => Date.parse(b.progress.updatedAt) - Date.parse(a.progress.updatedAt))
        return items.slice(0, HOME_CONTINUE_LIMIT)
    }, [userId, remoteProgress, progressByKey, books])

    return { continueBooks }
}
