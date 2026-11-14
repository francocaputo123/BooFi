import { CatalogBook } from "@/types/catalog.types"

/**
 * Ordena los libros por rating de mayor a menor (RF3.3).
 * - Los libros sin rating (null) quedan al final.
 * - Con el mismo rating se respeta el orden original (el catalogo viene del mas nuevo al mas viejo).
 * No modifica el arreglo original.
 * @param books : libros a ordenar
 * @param limitCount : si se pasa, devuelve solo los primeros N
 * @returns CatalogBook[] : libros ordenados
 */
export const sortBooksByRating = (books: CatalogBook[], limitCount?: number): CatalogBook[] => {
    const sorted = books
        // Se guarda la posicion original para desempatar sin depender de que sort() del motor sea estable
        .map((book, originalIndex) => ({ book, originalIndex }))
        .sort((a, b) => {
            if (a.book.rating === null && b.book.rating === null) return a.originalIndex - b.originalIndex
            if (a.book.rating === null) return 1
            if (b.book.rating === null) return -1

            return b.book.rating - a.book.rating || a.originalIndex - b.originalIndex
        })
        .map(({ book }) => book)

    return limitCount === undefined ? sorted : sorted.slice(0, Math.max(0, limitCount))
}
