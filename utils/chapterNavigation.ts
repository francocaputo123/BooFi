import { ChapterNavigation } from "@/types/reading.types"

/**
 * Calcula a que capitulos se puede ir desde el actual.
 * @param currentIndex : indice (desde 0) del capitulo que se esta leyendo
 * @param totalChapters : cantidad total de capitulos del libro
 * @returns ChapterNavigation : indices vecinos, o null si no existen
 */
export const getChapterNavigation = (
    currentIndex: number,
    totalChapters: number
): ChapterNavigation => {
    return {
        previousIndex: currentIndex > 0 ? currentIndex - 1 : null,
        nextIndex: currentIndex < totalChapters - 1 ? currentIndex + 1 : null,
    }
}

/**
 * Mantiene un indice dentro del rango valido. Hace falta porque el progreso guardado
 * podria apuntar a un capitulo que ya no existe (por ejemplo si se recargo un .epub distinto).
 * @param index : indice a validar
 * @param totalChapters : cantidad total de capitulos del libro
 * @returns number : indice dentro de [0, totalChapters - 1]
 */
export const clampChapterIndex = (index: number, totalChapters: number): number => {
    if (totalChapters <= 0) return 0
    return Math.min(Math.max(index, 0), totalChapters - 1)
}

/**
 * Texto "Capítulo X de Y" para mostrar en pantalla (el indice interno arranca en 0).
 */
export const formatChapterCounter = (currentIndex: number, totalChapters: number): string => {
    return `Capítulo ${currentIndex + 1} de ${totalChapters}`
}
