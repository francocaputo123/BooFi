import { useEffect, useState } from "react"
import bookStore from "@/store/bookStore"
import { fetchPublishedBook } from "@/services/publishedBookService"
import { publishedBookToEpubBook } from "@/utils/publishedBookEpubBook"
import { READER_LABELS } from "@/data/readingData"

/**
 * Se asegura de que el libro este en bookStore: si no esta, lo baja de Firestore.
 * @param bookId : id del libro (vacio si la ruta no trajo id)
 * @returns isLoadingBook : true mientras se busca en Firestore
 * @returns loadErrorMessage : texto del error, o "" si no hubo
 */
export const usePublishedBook = (bookId: string) => {
    const hasBook = bookStore((state) => Boolean(state.booksById[bookId]))
    const saveBook = bookStore((state) => state.saveBook)

    const [isLoadingBook, setIsLoadingBook] = useState(!hasBook && bookId !== "")
    const [loadErrorMessage, setLoadErrorMessage] = useState("")

    useEffect(() => {
        if (!bookId || hasBook) {
            setIsLoadingBook(false)
            return
        }

        // Si el usuario sale de la pantalla antes de que termine, no se toca el estado
        let isCancelled = false

        const loadBook = async () => {
            setIsLoadingBook(true)
            setLoadErrorMessage("")

            try {
                const publishedBook = await fetchPublishedBook(bookId)
                if (isCancelled) return

                if (!publishedBook) {
                    setLoadErrorMessage(READER_LABELS.PUBLISHED_BOOK_NOT_FOUND)
                    return
                }
                saveBook(publishedBookToEpubBook(publishedBook))
            } catch (error) {
                if (isCancelled) return
                setLoadErrorMessage(error instanceof Error ? error.message : READER_LABELS.PUBLISHED_BOOK_NOT_FOUND)
            } finally {
                if (!isCancelled) setIsLoadingBook(false)
            }
        }

        loadBook()

        return () => {
            isCancelled = true
        }
    }, [bookId, hasBook, saveBook])

    return { isLoadingBook, loadErrorMessage }
}