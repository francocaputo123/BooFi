import { doc, getDoc } from "firebase/firestore"
import { getDownloadURL, ref } from "firebase/storage"
import { db, storage } from "@/config/firebaseConfig"
import { BOOKS_COLLECTION } from "@/data/publishData"
import { READER_LABELS } from "@/data/readingData"
import { PublishedBook, PublishedBookData, PublishedChapter } from "@/types/book.types"
import { handleFirebaseError } from "@/utils/handleFirebaseError"
import { buildChapterPath } from "@/utils/storagePaths"

/**
 * Baja de Firestore el documento de un libro publicado (sin el texto de los capitulos).
 * @param bookId : id del documento en la coleccion "books"
 * @returns PublishedBook, o null si el libro no existe
 */
export const fetchPublishedBook = async (bookId: string): Promise<PublishedBook | null> => {
    try {
        const snapshot = await getDoc(doc(db, BOOKS_COLLECTION, bookId))
        if (!snapshot.exists()) return null

        return { id: snapshot.id, ...(snapshot.data() as PublishedBookData) }
    } catch (error) {
        console.error("[publishedBookService] No se pudo leer el libro:", error)
        throw new Error(handleFirebaseError(error))
    }
}

/**
 * Baja de Cloud Storage el texto de un capitulo publicado (archivo JSON).
 * NOTE: se usa getDownloadURL + fetch y no getBytes/getBlob, que en React Native dan problemas con Blob/ArrayBuffer.
 * @param bookId : id del libro publicado
 * @param chapterIndex : posicion del capitulo (empieza en 0)
 * @returns PublishedChapter : capitulo con sus bloques
 */
export const fetchPublishedChapter = async (
    bookId: string,
    chapterIndex: number
): Promise<PublishedChapter> => {
    try {
        const chapterUrl = await getDownloadURL(ref(storage, buildChapterPath(bookId, chapterIndex)))
        const response = await fetch(chapterUrl)
        if (!response.ok) {
            throw new Error(`Respuesta ${response.status} al bajar el capitulo`)
        }

        const chapter = (await response.json()) as PublishedChapter
        if (!Array.isArray(chapter.blocks)) {
            throw new Error("El capitulo no tiene el formato esperado")
        }
        return chapter
    } catch (error) {
        console.error("[publishedBookService] No se pudo bajar el capitulo:", error)
        throw new Error(READER_LABELS.CHAPTER_LOAD_ERROR)
    }
}