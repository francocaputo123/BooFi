import { READ_BUTTON_LABELS } from "@/data/readingData"
import { ReadingProgress } from "@/types/reading.types"
import { clampChapterIndex } from "@/utils/chapterNavigation"

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

/**
 * Porcentaje de lectura por capitulos: el capitulo que se esta leyendo cuenta como avanzado.
 * Ej: capitulo 3 de 10 (indice 2) = 30%; el ultimo capitulo = 100%.
 * @param chapterIndex : indice (desde 0) del capitulo guardado en el progreso
 * @param totalChapters : cantidad de capitulos del libro
 * @returns number : entero entre 0 y 100 (0 si no se sabe la cantidad de capitulos)
 */
export const getReadingPercent = (chapterIndex: number, totalChapters: number): number => {
    if (totalChapters <= 0) return 0
    const currentChapter = clampChapterIndex(chapterIndex, totalChapters) + 1
    return Math.round((currentChapter / totalChapters) * 100)
}
