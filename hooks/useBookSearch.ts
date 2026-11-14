import { useCallback, useMemo, useRef, useState } from "react"
import { useFocusEffect } from "expo-router"
import { fetchCatalogBooks } from "@/services/catalogService"
import { filterBooks } from "@/utils/filterBooks"
import { sortBooksByRating } from "@/utils/sortBooks"
import { CATALOG_LABELS, CATALOG_PAGE_SIZE, FEATURED_BOOKS_LIMIT } from "@/data/catalogData"
import { CatalogBook } from "@/types/catalog.types"

/**
 * Maneja el buscador de Explorar: baja el catalogo y guarda lo que el usuario elige
 * (texto y genero). Los resultados se recalculan solos cuando algo cambia.
 * El catalogo se vuelve a pedir cada vez que se entra a la pantalla, asi un libro recien
 * publicado aparece sin tener que reiniciar la app.
 * @returns isLoading / errorMessage / filteredBooks : los estados Loading, Error y Data que pide el README
 * @returns featuredBooks : los mejor calificados, de mayor a menor rating (RF3.3)
 * @returns paginatedBooks / hasMoreBooks / loadMoreBooks : el listado general por tandas (RF3.4)
 * @returns reloadBooks : pide el catalogo mostrando el "cargando" (boton "Reintentar" / "Actualizar")
 * @returns refreshBooks : lo pide sin tapar la lista (gesto de arrastrar hacia abajo)
 */
export const useBookSearch = () => {
    const [books, setBooks] = useState<CatalogBook[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const [searchText, setSearchText] = useState("")
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
    const [visibleCount, setVisibleCount] = useState(CATALOG_PAGE_SIZE)

    // Un ref (y no un estado) porque cambiarlo no tiene que volver a dibujar la pantalla
    const hasLoadedOnce = useRef(false)

    const loadBooks = useCallback(async (showSpinner: boolean) => {
        if (showSpinner) setIsLoading(true)
        setErrorMessage("")

        try {
            setBooks(await fetchCatalogBooks())
            hasLoadedOnce.current = true
        } catch (error) {
            // Si ya habia libros en pantalla, BookSearch los sigue mostrando e ignora este error
            setErrorMessage(error instanceof Error ? error.message : CATALOG_LABELS.LOAD_ERROR)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    // La primera vez muestra el "cargando" a pantalla completa, las siguientes actualizan sin tapar la lista
    useFocusEffect(
        useCallback(() => {
            loadBooks(!hasLoadedOnce.current)
        }, [loadBooks])
    )

    const reloadBooks = useCallback(() => loadBooks(true), [loadBooks])

    const refreshBooks = useCallback(async () => {
        setIsRefreshing(true)
        await loadBooks(false)
    }, [loadBooks])

    /*
     * La paginacion vuelve a la primera tanda SOLO cuando el usuario cambia un filtro.
     * No se reinicia al recargar el catalogo: al volver de la ficha de un libro la pantalla vuelve a
     * pedir los datos, y si se reiniciara el usuario perderia el lugar donde estaba leyendo la lista.
     */
    const changeSearchText = useCallback((text: string) => {
        setSearchText(text)
        setVisibleCount(CATALOG_PAGE_SIZE)
    }, [])

    const changeSelectedGenre = useCallback((genre: string | null) => {
        setSelectedGenre(genre)
        setVisibleCount(CATALOG_PAGE_SIZE)
    }, [])

    const clearFilters = useCallback(() => {
        setSearchText("")
        setSelectedGenre(null)
        setVisibleCount(CATALOG_PAGE_SIZE)
    }, [])

    const loadMoreBooks = useCallback(() => {
        setVisibleCount((current) => current + CATALOG_PAGE_SIZE)
    }, [])

    // useMemo evita volver a filtrar toda la lista cuando cambia algo que no la afecta (ej. isLoading)
    const filteredBooks = useMemo(
        () => filterBooks(books, { searchText, genre: selectedGenre }),
        [books, searchText, selectedGenre]
    )

    // Los libros sin rating no entran en "Tendencias": un carrusel de "destacados" sin nota no tendria sentido
    const featuredBooks = useMemo(
        () => sortBooksByRating(books.filter((book) => book.rating !== null), FEATURED_BOOKS_LIMIT),
        [books]
    )

    const paginatedBooks = useMemo(() => filteredBooks.slice(0, visibleCount), [filteredBooks, visibleCount])
    const hasMoreBooks = visibleCount < filteredBooks.length

    const hasActiveFilters = searchText.trim() !== "" || selectedGenre !== null

    return {
        books,
        featuredBooks,
        filteredBooks,
        paginatedBooks,
        hasMoreBooks,
        loadMoreBooks,
        isLoading,
        isRefreshing,
        errorMessage,
        reloadBooks,
        refreshBooks,
        searchText,
        setSearchText: changeSearchText,
        selectedGenre,
        setSelectedGenre: changeSelectedGenre,
        clearFilters,
        hasActiveFilters,
    }
}
