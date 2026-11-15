import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { useBookSearch } from "@/hooks/useBookSearch"
import { fetchCatalogBooks } from "@/services/catalogService"
import { CATALOG_PAGE_SIZE, FEATURED_BOOKS_LIMIT } from "@/data/catalogData"
import { makeBook, makeBooks } from "../helpers"

// El hook solo usa useFocusEffect de expo-router: aca se reemplaza por un useEffect que corre una vez al montar
jest.mock("expo-router", () => {
    const { useEffect } = require("react")
    return { useFocusEffect: (callback: () => void) => useEffect(callback, [callback]) }
})

// Firestore no se toca en las pruebas: el servicio se reemplaza y cada prueba decide que devuelve
jest.mock("@/services/catalogService", () => ({ fetchCatalogBooks: jest.fn() }))

const mockedFetch = jest.mocked(fetchCatalogBooks)

/** Monta el hook y espera a que termine la primera carga. */
const renderLoadedHook = async (books = makeBooks(25)) => {
    mockedFetch.mockResolvedValue(books)
    const hook = renderHook(() => useBookSearch())
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false))
    return hook
}

beforeEach(() => {
    mockedFetch.mockReset()
})

describe("useBookSearch: carga (estados Loading / Error / Data)", () => {
    it("arranca cargando y despues muestra los libros", async () => {
        mockedFetch.mockResolvedValue(makeBooks(3))
        const { result } = renderHook(() => useBookSearch())

        expect(result.current.isLoading).toBe(true)
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.books).toHaveLength(3)
        expect(result.current.errorMessage).toBe("")
    })

    it("si la primera carga falla, informa el error y no hay libros", async () => {
        mockedFetch.mockRejectedValue(new Error("sin conexion"))
        const { result } = renderHook(() => useBookSearch())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.errorMessage).toBe("sin conexion")
        expect(result.current.books).toHaveLength(0)
    })

    it("si una actualizacion falla, conserva los libros que ya estaban", async () => {
        const { result } = await renderLoadedHook(makeBooks(5))

        mockedFetch.mockRejectedValue(new Error("sin conexion"))
        await act(async () => {
            await result.current.refreshBooks()
        })

        expect(result.current.books).toHaveLength(5)
        expect(result.current.errorMessage).toBe("sin conexion")
    })
})

describe("useBookSearch: paginacion (RF3.4)", () => {
    it("muestra solo la primera tanda al cargar", async () => {
        const { result } = await renderLoadedHook(makeBooks(25))

        expect(result.current.paginatedBooks).toHaveLength(CATALOG_PAGE_SIZE)
        expect(result.current.hasMoreBooks).toBe(true)
    })

    it("cada 'cargar mas' suma una tanda mas, hasta mostrar todos", async () => {
        const { result } = await renderLoadedHook(makeBooks(25))

        act(() => result.current.loadMoreBooks())
        expect(result.current.paginatedBooks).toHaveLength(18)
        expect(result.current.hasMoreBooks).toBe(true)

        act(() => result.current.loadMoreBooks())
        expect(result.current.paginatedBooks).toHaveLength(25)
        expect(result.current.hasMoreBooks).toBe(false)
    })

    it("con 9 libros justos no ofrece 'cargar mas'", async () => {
        const { result } = await renderLoadedHook(makeBooks(CATALOG_PAGE_SIZE))

        expect(result.current.paginatedBooks).toHaveLength(CATALOG_PAGE_SIZE)
        expect(result.current.hasMoreBooks).toBe(false)
    })

    it("con menos libros que una tanda muestra todos", async () => {
        const { result } = await renderLoadedHook(makeBooks(4))

        expect(result.current.paginatedBooks).toHaveLength(4)
        expect(result.current.hasMoreBooks).toBe(false)
    })

    it("con el catalogo vacio no muestra nada ni ofrece 'cargar mas'", async () => {
        const { result } = await renderLoadedHook([])

        expect(result.current.paginatedBooks).toHaveLength(0)
        expect(result.current.hasMoreBooks).toBe(false)
    })

    it("vuelve a la primera tanda al cambiar el genero", async () => {
        const books = makeBooks(25, { tags: ["Drama"] })
        const { result } = await renderLoadedHook(books)
        act(() => result.current.loadMoreBooks())
        expect(result.current.paginatedBooks).toHaveLength(18)

        act(() => result.current.setSelectedGenre("Drama"))

        expect(result.current.paginatedBooks).toHaveLength(CATALOG_PAGE_SIZE)
    })

    it("vuelve a la primera tanda al escribir en el buscador", async () => {
        const { result } = await renderLoadedHook(makeBooks(25))
        act(() => result.current.loadMoreBooks())

        act(() => result.current.setSearchText("libro"))

        expect(result.current.paginatedBooks).toHaveLength(CATALOG_PAGE_SIZE)
    })

    it("vuelve a la primera tanda al limpiar los filtros", async () => {
        const { result } = await renderLoadedHook(makeBooks(25))
        // Como en la app: "Limpiar filtros" solo se ofrece cuando hay un filtro activo
        act(() => result.current.setSearchText("libro"))
        act(() => result.current.loadMoreBooks())
        expect(result.current.paginatedBooks).toHaveLength(18)

        act(() => result.current.clearFilters())

        expect(result.current.paginatedBooks).toHaveLength(CATALOG_PAGE_SIZE)
        expect(result.current.hasActiveFilters).toBe(false)
    })

    it("pagina sobre los resultados filtrados, no sobre todo el catalogo", async () => {
        const books = [...makeBooks(20, { tags: ["Drama"] }).map((b) => ({ ...b, id: `d-${b.id}` })), ...makeBooks(5)]
        const { result } = await renderLoadedHook(books)

        act(() => result.current.setSelectedGenre("Drama"))

        expect(result.current.filteredBooks).toHaveLength(20)
        expect(result.current.paginatedBooks).toHaveLength(CATALOG_PAGE_SIZE)
        expect(result.current.hasMoreBooks).toBe(true)
    })

    it("NO pierde el lugar en la lista al actualizar el catalogo (ej. al volver de la ficha de un libro)", async () => {
        const { result } = await renderLoadedHook(makeBooks(25))
        act(() => result.current.loadMoreBooks())
        expect(result.current.paginatedBooks).toHaveLength(18)

        // Volver a una pantalla vuelve a pedir el catalogo: llega un arreglo nuevo, con los mismos libros
        mockedFetch.mockResolvedValue(makeBooks(25))
        await act(async () => {
            await result.current.refreshBooks()
        })

        expect(result.current.paginatedBooks).toHaveLength(18)
    })
})

describe("useBookSearch: destacados por rating (RF3.3)", () => {
    it("ordena los destacados de mayor a menor rating", async () => {
        const books = [
            makeBook({ id: "a", rating: 3.0 }),
            makeBook({ id: "b", rating: 4.9 }),
            makeBook({ id: "c", rating: 4.1 }),
        ]
        const { result } = await renderLoadedHook(books)

        expect(result.current.featuredBooks.map((book) => book.id)).toEqual(["b", "c", "a"])
    })

    it("no incluye los libros sin rating", async () => {
        const books = [makeBook({ id: "a", rating: null }), makeBook({ id: "b", rating: 2.5 })]
        const { result } = await renderLoadedHook(books)

        expect(result.current.featuredBooks.map((book) => book.id)).toEqual(["b"])
    })

    it("si ningun libro tiene rating, no hay destacados", async () => {
        const { result } = await renderLoadedHook(makeBooks(5))

        expect(result.current.featuredBooks).toEqual([])
    })

    it(`muestra como maximo ${FEATURED_BOOKS_LIMIT} destacados`, async () => {
        const books = makeBooks(12).map((book, index) => ({ ...book, rating: 1 + index * 0.1 }))
        const { result } = await renderLoadedHook(books)

        expect(result.current.featuredBooks).toHaveLength(FEATURED_BOOKS_LIMIT)
        expect(result.current.featuredBooks[0].id).toBe("book-12")
    })

    it("los destacados no cambian al filtrar o buscar", async () => {
        const books = [makeBook({ id: "a", rating: 4, tags: ["Drama"] }), makeBook({ id: "b", rating: 5, tags: [] })]
        const { result } = await renderLoadedHook(books)

        act(() => result.current.setSelectedGenre("Drama"))

        expect(result.current.featuredBooks.map((book) => book.id)).toEqual(["b", "a"])
        expect(result.current.hasActiveFilters).toBe(true)
    })
})
