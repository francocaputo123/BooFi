import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore"
import { db } from "@/config/firebaseConfig"
import { READING_PROGRESS_COLLECTION } from "@/data/readingData"
import { readingProgressSchema } from "@/schema/reading.schema"
import { ReadingProgress } from "@/types/reading.types"
import { handleFirebaseError } from "@/utils/handleFirebaseError"

/* Documento users/{uid}/readingProgress/{bookId}: mismo patrón que los borradores (users/{uid}/drafts) */
const progressRef = (userId: string, bookId: string) =>
    doc(db, "users", userId, READING_PROGRESS_COLLECTION, bookId)

/**
 * Baja de Firestore el progreso de lectura de un usuario en un libro.
 * @param userId : uid del usuario logueado
 * @param bookId : id del libro publicado
 * @returns ReadingProgress, o null si todavía no leyó el libro (o el dato guardado es inválido)
 */
export const fetchRemoteProgress = async (
    userId: string,
    bookId: string
): Promise<ReadingProgress | null> => {
    try {
        const snapshot = await getDoc(progressRef(userId, bookId))
        if (!snapshot.exists()) return null

        // Se valida porque Firestore no garantiza la forma de los datos
        const result = readingProgressSchema.safeParse(snapshot.data())
        return result.success ? result.data : null
    } catch (error) {
        console.error("[readingProgressService] No se pudo leer el progreso:", error)
        throw new Error(handleFirebaseError(error))
    }
}

/**
 * Baja de Firestore el progreso de TODOS los libros que leyo un usuario (para "Seguir leyendo" en el Home).
 * Es una sola consulta a la subcoleccion users/{uid}/readingProgress.
 * @param userId : uid del usuario logueado
 * @returns ReadingProgress[] : progresos validos (los documentos con datos invalidos se ignoran)
 */
export const fetchAllRemoteProgress = async (userId: string): Promise<ReadingProgress[]> => {
    try {
        const snapshot = await getDocs(collection(db, "users", userId, READING_PROGRESS_COLLECTION))

        const progressList: ReadingProgress[] = []
        snapshot.docs.forEach((document) => {
            const result = readingProgressSchema.safeParse(document.data())
            if (result.success) progressList.push(result.data)
        })
        return progressList
    } catch (error) {
        console.error("[readingProgressService] No se pudo leer el progreso de los libros:", error)
        throw new Error(handleFirebaseError(error))
    }
}

/**
 * Guarda en Firestore el progreso de lectura (reemplaza el anterior del mismo libro).
 * @param userId : uid del usuario logueado
 * @param progress : capítulo y posición actuales
 */
export const saveRemoteProgress = async (
    userId: string,
    progress: ReadingProgress
): Promise<void> => {
    try {
        await setDoc(progressRef(userId, progress.bookId), progress)
    } catch (error) {
        console.error("[readingProgressService] No se pudo guardar el progreso:", error)
        throw new Error(handleFirebaseError(error))
    }
}
