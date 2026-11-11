import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import { PAID_BADGE_LABEL } from "@/data/catalogData"
import { CatalogBook } from "@/types/catalog.types"
import { formatPrice } from "@/utils/formatPrice"

interface BookCardProps {
    book: CatalogBook
    /* El ancho lo calcula la grilla: con flex:1 la ultima fila incompleta estiraria las tarjetas */
    width: number
    /* TODO: navegar a la ficha (Sinopsis) cuando esa pantalla pueda leer libros desde Firestore */
    onPress?: () => void
}

/**
 * Tarjeta de libro (Explorar y Home): portada, titulo y autor.
 * Si el libro es de pago se muestra un cartelito sobre la portada ("Pago $1.500").
 * No hay cartel de estado: un libro publicado se considera completo.
 */
const BookCard = ({ book, width, onPress }: BookCardProps) => {
    const isPaid = book.visibility === "paid"
    // Si por algun motivo el libro de pago no trae precio, el cartel dice solo "Pago"
    const badgeText = book.price ? `${PAID_BADGE_LABEL} ${formatPrice(book.price)}` : PAID_BADGE_LABEL

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

                {isPaid && (
                    <View style={styles.paidBadge}>
                        <Text style={styles.paidBadgeText} numberOfLines={1}>{badgeText}</Text>
                    </View>
                )}
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
    paidBadge: {
        position: "absolute",
        left: SPACING.xs + 2,
        bottom: SPACING.xs + 2,
        maxWidth: "90%",
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingHorizontal: SPACING.s - 2,
        paddingVertical: 2,
    },
    paidBadgeText: {
        color: COLORS.background,
        fontSize: 10,
        fontWeight: "700",
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
