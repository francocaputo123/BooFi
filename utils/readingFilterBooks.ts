import { CatalogBook } from "@/types/catalog.types"

/**
 * Filtra el catalogo por los libros que el usuario ya empezo a leer. Es una funcion pura
 * (no usa Firebase ni React) para poder probarla sola y reutilizarla.
 * @param books : libros a filtrar
 * @param readingBookIds : ids de los libros que el usuario esta leyendo
 * @returns CatalogBook[] : libros que cumplen los criterios
 */
export const filterBooksInProgress = (books: CatalogBook[], readingBookIds: string[]): CatalogBook[] => {
    const readingIds = new Set(readingBookIds)
    return books.filter((book) => readingIds.has(book.id))
}   
 