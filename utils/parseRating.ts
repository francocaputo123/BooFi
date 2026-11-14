/**
 * Convierte el campo "rating" de Firestore en un numero valido de 0 a 5 con un decimal.
 * Firestore no garantiza el tipo (puede venir un texto, un numero fuera de rango o faltar), y un valor
 * invalido no tiene que romper el orden de "Tendencias" ni mostrar "NaN" en pantalla.
 * @param rawRating : valor tal cual vino de Firestore
 * @returns number | null : rating valido, o null si no hay uno confiable
 */
export const parseRating = (rawRating: unknown): number | null => {
    if (typeof rawRating !== "number" || !Number.isFinite(rawRating)) return null
    if (rawRating < 0 || rawRating > 5) return null

    return Math.round(rawRating * 10) / 10
}
