import { EpubParsedBook } from "@/types/epub.types"

/*
 * Estimacion gruesa de lectura: se cuentan los caracteres de todos los bloques,
 * se dividen por CHARS_PER_WORD (promedio de letras por palabra en castellano)
 * y despues por WORDS_PER_MINUTE. Da un rango de +/-15% para no vender exactitud
 * que no tenemos: no sabemos la velocidad real de cada lector.
 */
const CHARS_PER_WORD = 5
const WORDS_PER_MINUTE = 200
const RANGE_MARGIN = 0.15

export interface ReadingTimeRange {
    min: number
    max: number
}

/**
 * Estima cuanto se tarda en leer un capitulo promedio del libro.
 * @param book : libro parseado
 * @returns ReadingTimeRange | null : rango en minutos, o null si el libro no tiene texto
 */
export const estimateReadingMinutesPerChapter = (book: EpubParsedBook): ReadingTimeRange | null => {
    if (book.chapters.length === 0) return null

    const totalChars = book.chapters.reduce((chapterSum, chapter) => {
        return chapterSum + chapter.blocks.reduce((blockSum, block) => {
            return blockSum + block.spans.reduce((spanSum, span) => spanSum + span.text.length, 0)
        }, 0)
    }, 0)

    if (totalChars === 0) return null

    const totalWords = totalChars / CHARS_PER_WORD
    const totalMinutes = totalWords / WORDS_PER_MINUTE
    const perChapter = totalMinutes / book.chapters.length

    return {
        min: Math.max(1, Math.floor(perChapter * (1 - RANGE_MARGIN))),
        max: Math.max(1, Math.ceil(perChapter * (1 + RANGE_MARGIN))),
    }
}

/**
 * Formatea el rango para mostrarlo en pantalla.
 * @param range : rango calculado por estimateReadingMinutesPerChapter
 * @returns string : ej "10-12 min/cap", o "—" si no hay estimacion
 */
export const formatReadingTime = (range: ReadingTimeRange | null): string => {
    if (!range) return "—"
    return `${range.min}-${range.max} min/cap`
}