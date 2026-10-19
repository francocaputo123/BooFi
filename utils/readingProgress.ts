import { READ_BUTTON_LABELS } from "@/data/readingData"
import { ReadingProgress } from "@/types/reading.types"

/**
 * El progreso se guarda por usuario y por libro, para que dos cuentas
 * en el mismo celular no se pisen el punto de lectura.
 */
export const buildProgressKey = (userId: string, bookId: string): string => {
    return `${userId}:${bookId}`
}

/**
 * Se considera "empezado" apenas existe un progreso guardado: el lector lo crea
 * al abrirse, asi que "Comenzar a leer" ya cuenta como haber empezado.
 */
export const hasStartedReading = (progress?: ReadingProgress): boolean => {
    return progress !== undefined
}

/**
 * Texto del boton principal de la ficha del libro (US-4.3).
 */
export const getReadButtonLabel = (progress?: ReadingProgress): string => {
    return hasStartedReading(progress) ? READ_BUTTON_LABELS.CONTINUE : READ_BUTTON_LABELS.START
}
