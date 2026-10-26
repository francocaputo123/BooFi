import { FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native"
import { useRouter } from "expo-router"
import BookCard from "@/components/BookCard"
import SearchBar from "@/components/ui/SearchBar"
import GenreChips from "@/components/ui/GenreChips"
import FeedbackMessage from "@/components/ui/FeedbackMessage"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import { ALL_GENRES_LABEL, BOOK_GENRES, CATALOG_LABELS, GRID_COLUMNS, GRID_GAP } from "@/data/catalogData"
import { useBookSearch } from "@/hooks/useBookSearch"

/**
 * Pantalla de Explorar: busqueda por titulo o autor, chips de genero y grilla de historias.
 * Los datos y la logica viven en useBookSearch; aca solo se dibuja segun el estado.
 */
const BookSearch = () => {
    const { width: screenWidth } = useWindowDimensions()
    const router = useRouter()
    const {
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
    } = useBookSearch()

    const cardWidth = (screenWidth - SPACING.l * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS

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
            <>
                <Text style={styles.sectionLabel}>{CATALOG_LABELS.SECTION_ALL}</Text>
                <FlatList
                    data={filteredBooks}
                    keyExtractor={(book) => book.id}
                    numColumns={GRID_COLUMNS}
                    columnWrapperStyle={styles.gridRow}
                    renderItem={({ item }) => (
                        <BookCard
                            book={item}
                            width={cardWidth}
                            onPress={() => router.push({ pathname: "/books/Details", params: { id: item.id } })}
                        />
                    )}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={refreshBooks}
                />
            </>
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
})

export default BookSearch