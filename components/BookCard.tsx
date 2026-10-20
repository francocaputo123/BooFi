import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import { BOOK_STATUS_LABELS } from "@/data/catalogData"
import { CatalogBook } from "@/types/catalog.types"

interface BookCardProps {
    book: CatalogBook
    /* El ancho lo calcula la grilla: con flex:1 la ultima fila incompleta estiraria las tarjetas */
    width: number
    /* TODO: navegar a la ficha (Sinopsis) cuando esa pantalla pueda leer libros desde Firestore */
    onPress?: () => void
}

/**
 * Tarjeta de la grilla de Explorar: portada, titulo y autor.
 * El estado (Completa / En progreso) se muestra sobre la portada.
 * TODO: RF4.4 pide el indicador en la ficha del libro; cuando exista esa pantalla, agregarlo ahi tambien.
 */
const BookCard = ({ book, width, onPress }: BookCardProps) => {
    const isCompleted = book.status === "completed"

    return (
        <Pressable style={{ width }} onPress={onPress} disabled={!onPress}>
            <View style={styles.cover}>
                {book.coverUrl ? (
                    <Image source={{ uri: book.coverUrl }} style={styles.coverImage} resizeMode="cover" />
                ) : (
                    // Los libros sin portada llegan con coverUrl null: se muestra la inicial del titulo
                    <View style={styles.coverPlaceholder}>
                        <Text style={styles.coverInitial}>{book.title.charAt(0).toUpperCase()}</Text>
                    </View>
                )}

                <View style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
                    <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
                        {BOOK_STATUS_LABELS[book.status]}
                    </Text>
                </View>
            </View>

            <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
            <Text style={styles.author} numberOfLines={1}>{book.authorName}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    cover: {
        aspectRatio: 2 / 3,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: COLORS.border,
        marginBottom: SPACING.s,
    },
    coverImage: {
        width: "100%",
        height: "100%",
    },
    coverPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    coverInitial: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.xxxl,
        fontWeight: "700",
    },
    statusBadge: {
        position: "absolute",
        left: SPACING.xs + 2,
        bottom: SPACING.xs + 2,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        paddingHorizontal: SPACING.s - 2,
        paddingVertical: 2,
    },
    statusBadgeCompleted: {
        backgroundColor: COLORS.success,
    },
    statusText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: "600",
    },
    statusTextCompleted: {
        color: COLORS.successText,
    },
    title: {
        color: COLORS.text,
        fontSize: FONTSIZE.s,
        fontWeight: "600",
    },
    author: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.xs,
        marginBottom: SPACING.m,
    },
})

export default BookCard
