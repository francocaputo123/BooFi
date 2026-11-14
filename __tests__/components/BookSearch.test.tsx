import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import BookSearch from "@/components/BookSearch"
import { fetchCatalogBooks } from "@/services/catalogService"
import { CATALOG_LABELS } from "@/data/catalogData"
import { makeBooks } from "../helpers"

const mockPush = jest.fn()

// Cuantas veces se MONTO cada tarjeta. Si una tarjeta se monta de nuevo, es que React la destruyo y la volvio a crear
const mockMountCounts: Record<string, number> = {}

jest.mock("expo-router", () => {
    const { useEffect } = require("react")
    return {
        useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
        useRouter: () => ({ push: (...args: unknown[]) => mockPush(...args) }),
    }
})

jest.mock("@/services/catalogService", () => ({ fetchCatalogBooks: jest.fn() }))

// Los iconos necesitan cargar fuentes del celular, algo que Jest no hace: no aportan nada a estas pruebas
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }))

// La tarjeta real no interesa aca: se reemplaza por una que solo muestra el titulo y cuenta sus montajes
jest.mock("@/components/BookCard", () => {
    const React = require("react")
    const { Pressable, Text } = require("react-native")
    return {
        __esModule: true,
        default: ({ book, showRating, onPress }: { book: { id: string; title: string }; showRating?: boolean; onPress?: () => void }) => {
            const zone = showRating ? "featured" : "grid"
            React.useEffect(() => {
                const key = `${zone}:${book.id}`
                mockMountCounts[key] = (mockMountCounts[key] ?? 0) + 1
            }, [])
            return React.createElement(
                Pressable,
                { testID: `${zone}-card`, onPress },
                React.createElement(Text, null, book.title)
            )
        },
    }
})

const mockedFetch = jest.mocked(fetchCatalogBooks)

const renderLoadedScreen = async (books = makeBooks(25)) => {
    mockedFetch.mockResolvedValue(books)
    render(<BookSearch />)
    await waitFor(() => expect(screen.queryByText(CATALOG_LABELS.LOADING)).toBeNull())
}

/** 25 libros: los 3 primeros con rating (el resto sin), para que haya "Tendencias" y mas de una tanda. */
const booksWithSomeRatings = () =>
    makeBooks(25).map((book, index) => ({ ...book, rating: index < 3 ? 4 + index * 0.2 : null }))

beforeEach(() => {
    mockedFetch.mockReset()
    mockPush.mockReset()
    Object.keys(mockMountCounts).forEach((key) => delete mockMountCounts[key])
})

describe("BookSearch: estados de la pantalla", () => {
    it("muestra el mensaje de carga mientras espera los libros", () => {
        mockedFetch.mockReturnValue(new Promise(() => {}))
        render(<BookSearch />)

        expect(screen.getByText(CATALOG_LABELS.LOADING)).toBeTruthy()
    })

    it("muestra el error con boton Reintentar si falla la primera carga", async () => {
        mockedFetch.mockRejectedValue(new Error("sin conexion"))
        render(<BookSearch />)

        expect(await screen.findByText("sin conexion")).toBeTruthy()
        expect(screen.getByText(CATALOG_LABELS.RETRY)).toBeTruthy()
    })

    it("muestra el mensaje de catalogo vacio", async () => {
        await renderLoadedScreen([])

        expect(screen.getByText(CATALOG_LABELS.EMPTY_CATALOG)).toBeTruthy()
        expect(screen.queryByText(CATALOG_LABELS.LOAD_MORE)).toBeNull()
    })

    it("muestra 'sin resultados' y permite limpiar la busqueda", async () => {
        await renderLoadedScreen(makeBooks(5))

        fireEvent.changeText(screen.getByPlaceholderText(CATALOG_LABELS.SEARCH_PLACEHOLDER), "zzzz")
        expect(screen.getByText(CATALOG_LABELS.NO_RESULTS)).toBeTruthy()

        fireEvent.press(screen.getByText(CATALOG_LABELS.CLEAR_FILTERS))
        expect(screen.queryByText(CATALOG_LABELS.NO_RESULTS)).toBeNull()
        expect(screen.getAllByTestId("grid-card")).toHaveLength(5)
    })
})

describe("BookSearch: carga paginada (RF3.4)", () => {
    it("muestra 9 historias y el boton 'Cargar mas' cuando hay mas", async () => {
        await renderLoadedScreen(makeBooks(25))

        expect(screen.getAllByTestId("grid-card")).toHaveLength(9)
        expect(screen.getByText(CATALOG_LABELS.LOAD_MORE)).toBeTruthy()
    })

    it("cada toque en 'Cargar mas' agrega 9 historias, y al llegar al final el boton desaparece", async () => {
        await renderLoadedScreen(makeBooks(25))

        fireEvent.press(screen.getByText(CATALOG_LABELS.LOAD_MORE))
        expect(screen.getAllByTestId("grid-card")).toHaveLength(18)

        fireEvent.press(screen.getByText(CATALOG_LABELS.LOAD_MORE))
        expect(screen.getAllByTestId("grid-card")).toHaveLength(25)
        expect(screen.queryByText(CATALOG_LABELS.LOAD_MORE)).toBeNull()
    })

    it("con 9 historias o menos no muestra 'Cargar mas'", async () => {
        await renderLoadedScreen(makeBooks(9))

        expect(screen.getAllByTestId("grid-card")).toHaveLength(9)
        expect(screen.queryByText(CATALOG_LABELS.LOAD_MORE)).toBeNull()
    })

    it("al buscar, la lista vuelve a la primera tanda", async () => {
        await renderLoadedScreen(makeBooks(25))
        fireEvent.press(screen.getByText(CATALOG_LABELS.LOAD_MORE))
        expect(screen.getAllByTestId("grid-card")).toHaveLength(18)

        fireEvent.changeText(screen.getByPlaceholderText(CATALOG_LABELS.SEARCH_PLACEHOLDER), "libro")

        expect(screen.getAllByTestId("grid-card")).toHaveLength(9)
    })
})

describe("BookSearch: seccion Tendencias (RF3.3)", () => {
    it("muestra Tendencias con los libros que tienen rating", async () => {
        await renderLoadedScreen(booksWithSomeRatings())

        expect(screen.getByText(CATALOG_LABELS.SECTION_FEATURED)).toBeTruthy()
        expect(screen.getAllByTestId("featured-card")).toHaveLength(3)
    })

    it("no muestra Tendencias si ningun libro tiene rating", async () => {
        await renderLoadedScreen(makeBooks(12))

        expect(screen.queryByText(CATALOG_LABELS.SECTION_FEATURED)).toBeNull()
    })

    it("oculta Tendencias mientras hay una busqueda o un genero activo, y vuelve al limpiar", async () => {
        await renderLoadedScreen(booksWithSomeRatings())
        const searchBox = screen.getByPlaceholderText(CATALOG_LABELS.SEARCH_PLACEHOLDER)

        fireEvent.changeText(searchBox, "libro")
        expect(screen.queryByText(CATALOG_LABELS.SECTION_FEATURED)).toBeNull()

        fireEvent.changeText(searchBox, "")
        expect(screen.getByText(CATALOG_LABELS.SECTION_FEATURED)).toBeTruthy()
    })

    it("al tocar un destacado abre la ficha de ese libro", async () => {
        await renderLoadedScreen(booksWithSomeRatings())

        fireEvent.press(screen.getAllByTestId("featured-card")[0])

        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(mockPush).toHaveBeenCalledWith({ pathname: "/books/Details", params: { id: expect.any(String) } })
    })

    it("tocar 'Cargar mas' NO vuelve a montar el carrusel de Tendencias (no pierde su posicion ni re-descarga portadas)", async () => {
        await renderLoadedScreen(booksWithSomeRatings())
        const featuredKeys = Object.keys(mockMountCounts).filter((key) => key.startsWith("featured:"))
        expect(featuredKeys).toHaveLength(3)

        fireEvent.press(screen.getByText(CATALOG_LABELS.LOAD_MORE))

        featuredKeys.forEach((key) => expect(mockMountCounts[key]).toBe(1))
    })
})
