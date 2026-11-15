import { CatalogBook } from "@/types/catalog.types"

/**
 * Arma un libro de prueba con valores por defecto. Cada prueba solo escribe lo que le importa.
 */
export const makeBook = (overrides: Partial<CatalogBook> = {}): CatalogBook => ({
    id: "1",
    title: "Libro de prueba",
    authorName: "Autor de prueba",
    coverUrl: null,
    tags: [],
    visibility: "public",
    price: null,
    rating: null,
    ...overrides,
})

/**
 * Arma una lista de N libros con ids y titulos numerados ("Libro 01", "Libro 02"...).
 * Sin rating, salvo que se lo pase en overrides.
 */
export const makeBooks = (count: number, overrides: Partial<CatalogBook> = {}): CatalogBook[] =>
    Array.from({ length: count }, (_, index) => {
        const number = String(index + 1).padStart(2, "0")
        return makeBook({ id: `book-${number}`, title: `Libro ${number}`, ...overrides })
    })
