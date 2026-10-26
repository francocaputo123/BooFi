import { doc, getDoc } from "firebase/firestore"
import { db } from "@/config/firebaseConfig"
import { BOOKS_COLLECTION } from "@/data/publishData"
import { PublishedBook, PublishedBookData } from "@/types/book.types"
import { handleFirebaseError } from "@/utils/handleFirebaseError"

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