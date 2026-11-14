import { useCallback, useEffect, useState } from "react"
import bookStore from "@/store/bookStore"
import { fetchPublishedChapter } from "@/services/publishedBookService"
import { READER_LABELS } from "@/data/readingData"
import { EpubParsedBook } from "@/types/epub.types"

/**
 * Se asegura de que el texto del capítulo esté disponible. En un libro publicado los capítulos
 * llegan sin texto y se bajan de Cloud Storage de a uno, recién cuando se leen.
 * En los libros locales (EPUB cargado o historia del Editor) no hace nada.
 * @param book : libro que se está leyendo
 * @param chapterIndex : capítulo actual (empieza en 0)
 * @returns isLoadingChapter : true mientras se baja el capítulo
 * @returns chapterErrorMessage : texto del error, o "" si no hubo
 * @returns retryLoad : vuelve a intentar la descarga
 */
export const usePublishedChapter = (book: EpubParsedBook, chapterIndex: number) => {
    const setChapterBlocks = bookStore((state) => state.setChapterBlocks)

    const chapter = book.chapters[chapterIndex]
    const needsDownload = Boolean(book.isPublished) && chapter !== undefined && !chapter.isLoaded

    // El error se asocia al capítulo que falló, así no aparece en otro capítulo al navegar
    const [failure, setFailure] = useState<{ chapterIndex: number; message: string } | null>(null)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        if (!needsDownload) return

        // Si el usuario cambia de capítulo antes de que termine, se ignora el resultado
        let isCancelled = false

        const loadChapter = async () => {
            try {
                const publishedChapter = await fetchPublishedChapter(book.id, chapterIndex)
                if (isCancelled) return
                setChapterBlocks(book.id, chapterIndex, publishedChapter.blocks)
            } catch (error) {
                if (isCancelled) return
                setFailure({
                    chapterIndex,
                    message: error instanceof Error ? error.message : READER_LABELS.CHAPTER_LOAD_ERROR,
                })
            }
        }

        loadChapter()

        return () => {
            isCancelled = true
        }
    }, [needsDownload, book.id, chapterIndex, attempt, setChapterBlocks])

    const retryLoad = useCallback(() => {
        setFailure(null)
        setAttempt((current) => current + 1)
    }, [])

    const chapterErrorMessage = failure?.chapterIndex === chapterIndex ? failure.message : ""

    return {
        isLoadingChapter: needsDownload && chapterErrorMessage === "",
        chapterErrorMessage,
        retryLoad,
    }
}
