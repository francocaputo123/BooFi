import { useCallback, useMemo, useRef, useState } from "react"
import { useFocusEffect } from "expo-router"
import { fetchCatalogBooks } from "@/services/catalogService"
import { filterBooks } from "@/utils/filterBooks"
import { CATALOG_LABELS } from "@/data/catalogData"
import { CatalogBook } from "@/types/catalog.types"

/**
 * Maneja el buscador de Explorar: baja el catalogo y guarda lo que el usuario elige
 * (texto y genero). Los resultados se recalculan solos cuando algo cambia.
 * El catalogo se vuelve a pedir cada vez que se entra a la pantalla, asi un libro recien
 * publicado aparece sin tener que reiniciar la app.
 * @returns isLoading / errorMessage / filteredBooks : los estados Loading, Error y Data que pide el README
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

    const clearFilters = useCallback(() => {
        setSearchText("")
        setSelectedGenre(null)
    }, [])

    // useMemo evita volver a filtrar toda la lista cuando cambia algo que no la afecta (ej. isLoading)
    const filteredBooks = useMemo(
        () => filterBooks(books, { searchText, genre: selectedGenre }),
        [books, searchText, selectedGenre]
    )

    const hasActiveFilters = searchText.trim() !== "" || selectedGenre !== null

    return {
        books,
        filteredBooks,
        isLoading,
        isRefreshing,
        errorMessage,
        reloadBooks,
        refreshBooks,
        searchText,
        setSearchText,
        selectedGenre,
        setSelectedGenre,
        clearFilters,
        hasActiveFilters,
    }
}
