import { CatalogBook, CatalogFilters } from "@/types/catalog.types"
import { normalizeText } from "@/utils/normalizeText"

/**
 * Filtra el catalogo por texto (titulo o autor) y por genero. Es una funcion pura
 * (no usa Firebase ni React) para poder probarla sola y reutilizarla.
 * Los dos criterios se combinan: el libro tiene que cumplir ambos.
 * @param books : libros a filtrar
 * @param filters : texto y genero elegidos por el usuario (genre null = todos)
 * @returns CatalogBook[] : libros que cumplen los criterios
 */
export const filterBooks = (books: CatalogBook[], filters: CatalogFilters): CatalogBook[] => {
    const normalizedSearch = normalizeText(filters.searchText)

    return books.filter((book) => {
        const matchesText =
            normalizedSearch === "" ||
            normalizeText(book.title).includes(normalizedSearch) ||
            normalizeText(book.authorName).includes(normalizedSearch)

        const matchesGenre = filters.genre === null || book.tags.includes(filters.genre)

        return matchesText && matchesGenre
    })
}
