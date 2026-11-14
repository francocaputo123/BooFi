import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native"
import { useRouter } from "expo-router"
import BookCard from "@/components/BookCard"
import SearchBar from "@/components/ui/SearchBar"
import GenreChips from "@/components/ui/GenreChips"
import FeedbackMessage from "@/components/ui/FeedbackMessage"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import {
    ALL_GENRES_LABEL,
    BOOK_GENRES,
    CATALOG_LABELS,
    FEATURED_CARD_WIDTH,
    GRID_COLUMNS,
    GRID_GAP,
} from "@/data/catalogData"
import { useBookSearch } from "@/hooks/useBookSearch"
import { useEffect } from "react"

/**
 * Pantalla de Explorar: busqueda por titulo o autor, chips de genero, "Tendencias" (mejor calificados)
 * y grilla de historias que se muestra por tandas con el boton "Cargar mas".
 * Los datos y la logica viven en useBookSearch; aca solo se dibuja segun el estado.
 */
const BookSearch = ( props : any) => {
    const { genreFromIndex = null } = props
    const { width: screenWidth } = useWindowDimensions()
    const router = useRouter()
    const {
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
        setSearchText,
        selectedGenre,
        setSelectedGenre,
        clearFilters,
        hasActiveFilters,
    } = useBookSearch()

    useEffect(()=>{ 
        if (genreFromIndex) {
            setSelectedGenre(genreFromIndex)
        }
    }, [genreFromIndex])

    const cardWidth = (screenWidth - SPACING.l * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS

    const openDetails = (bookId: string) => {
        router.push({ pathname: "/books/Details", params: { id: bookId } })
    }

    /*
     * Cabecera y pie se pasan como ELEMENTOS ya armados, no como funciones. Si se pasara una funcion
     * nueva en cada render, React la tomaria por un componente distinto y la desmontaria y volveria a
     * montar cada vez (ej. al tocar "Cargar mas"): el carrusel de Tendencias perderia su scroll y
     * volveria a descargar las portadas.
     */
    const listHeader = (
        <View>
            {/* Con una busqueda o un genero activos, "Tendencias" se oculta: el usuario esta buscando algo puntual */}
            {!hasActiveFilters && featuredBooks.length > 0 && (
                <View style={styles.featuredSection}>
                    <Text style={styles.sectionLabel}>{CATALOG_LABELS.SECTION_FEATURED}</Text>
                    <FlatList
                        horizontal
                        data={featuredBooks}
                        keyExtractor={(book) => `featured-${book.id}`}
                        contentContainerStyle={styles.featuredList}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <BookCard
                                book={item}
                                width={FEATURED_CARD_WIDTH}
                                showRating
                                onPress={() => openDetails(item.id)}
                            />
                        )}
                    />
                </View>
            )}
            <Text style={styles.sectionLabel}>{CATALOG_LABELS.SECTION_ALL}</Text>
        </View>
    )

    const listFooter = hasMoreBooks ? (
        <Pressable
            style={({ pressed }) => [styles.loadMoreButton, pressed && styles.loadMorePressed]}
            onPress={loadMoreBooks}
            accessibilityRole="button"
        >
            <Text style={styles.loadMoreText}>{CATALOG_LABELS.LOAD_MORE}</Text>
        </Pressable>
    ) : null

    const renderResults = () => {
        if (isLoading) {
            return <FeedbackMessage isLoading message={CATALOG_LABELS.LOADING} />
        }

        // Si una actualizacion falla pero ya hay libros en pantalla, se siguen mostrando en vez de tapar todo con el error
        if (errorMessage && books.length === 0) {
            return (
                <FeedbackMessage
                    message={errorMessage}
                    actionLabel={CATALOG_LABELS.RETRY}
                    onAction={reloadBooks}
                />
            )
        }

        if (filteredBooks.length === 0) {
            // Con el catalogo vacio "Limpiar filtros" no ayudaria: ahi se ofrece actualizar, por si se acaba de publicar algo
            if (books.length === 0) {
                return (
                    <FeedbackMessage
                        message={CATALOG_LABELS.EMPTY_CATALOG}
                        actionLabel={CATALOG_LABELS.REFRESH}
                        onAction={reloadBooks}
                    />
                )
            }

            return (
                <FeedbackMessage
                    message={CATALOG_LABELS.NO_RESULTS}
                    actionLabel={hasActiveFilters ? CATALOG_LABELS.CLEAR_FILTERS : undefined}
                    onAction={clearFilters}
                />
            )
        }

        return (
            <FlatList
                data={paginatedBooks}
                keyExtractor={(book) => book.id}
                numColumns={GRID_COLUMNS}
                columnWrapperStyle={styles.gridRow}
                ListHeaderComponent={listHeader}
                ListFooterComponent={listFooter}
                renderItem={({ item }) => (
                    <BookCard
                        book={item}
                        width={cardWidth}
                        onPress={() => openDetails(item.id)}
                    />
                )}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                refreshing={isRefreshing}
                onRefresh={refreshBooks}
            />
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{CATALOG_LABELS.SCREEN_TITLE}</Text>

            <SearchBar
                value={searchText}
                onChangeText={setSearchText}
                placeholder={CATALOG_LABELS.SEARCH_PLACEHOLDER}
            />

            <View style={styles.chips}>
                <GenreChips
                    genres={BOOK_GENRES}
                    selected={selectedGenre}
                    onSelect={setSelectedGenre}
                    allLabel={ALL_GENRES_LABEL}
                />
            </View>

            <View style={styles.results}>{renderResults()}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.l,
        backgroundColor: COLORS.background,
    },
    title: {
        marginBottom: SPACING.m,
        color: COLORS.text,
        fontSize: FONTSIZE.xxl,
        fontWeight: "bold",
    },
    chips: {
        marginTop: SPACING.m,
    },
    results: {
        flex: 1,
        marginTop: SPACING.m,
    },
    featuredSection: {
        marginBottom: SPACING.s,
    },
    featuredList: {
        gap: GRID_GAP,
    },
    sectionLabel: {
        marginBottom: SPACING.m,
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.xs,
        letterSpacing: 1.5,
        textTransform: "uppercase",
    },
    gridRow: {
        gap: GRID_GAP,
    },
    loadMoreButton: {
        alignSelf: "center",
        marginTop: SPACING.s,
        marginBottom: SPACING.l,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.s + 2,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    loadMorePressed: {
        backgroundColor: COLORS.surfacePressed,
    },
    loadMoreText: {
        color: COLORS.text,
        fontSize: FONTSIZE.s,
        fontWeight: "600",
    },
})

export default BookSearch