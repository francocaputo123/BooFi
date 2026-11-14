import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import { ContinueReadingItem } from "@/types/reading.types"
import { formatChapterCounter } from "@/utils/chapterNavigation"

interface ContinueReadingCardProps {
    item: ContinueReadingItem
    width: number
    onPress: () => void
}

/**
 * Tarjeta grande de "Seguir leyendo" (Home): portada, titulo, capitulo actual y barra con el % leido.
 */
const ContinueReadingCard = ({ item, width, onPress }: ContinueReadingCardProps) => {
    const { book, currentChapter, percent } = item

    return (
        <Pressable
            style={({ pressed }) => [styles.card, { width }, pressed && styles.cardPressed]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${book.title}, ${percent}% leído`}
        >
            <View style={styles.cover}>
                {book.coverUrl ? (
                    <Image source={{ uri: book.coverUrl }} style={styles.coverImage} resizeMode="cover" />
                ) : (
                    <View style={styles.coverPlaceholder}>
                        <Text style={styles.coverInitial}>{book.title.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
                <Text style={styles.author} numberOfLines={1}>{book.authorName}</Text>

                <View style={styles.progressBlock}>
                    <View style={styles.progressHeader}>
                        {/* Si el libro no trae la cantidad de capitulos no se puede decir "X de Y" */}
                        <Text style={styles.chapterText} numberOfLines={1}>
                            {book.chapterCount > 0 ? formatChapterCounter(currentChapter - 1, book.chapterCount) : ""}
                        </Text>
                        <Text style={styles.percentText}>{percent}%</Text>
                    </View>
                    <View style={styles.track}>
                        <View style={[styles.fill, { width: `${percent}%` }]} />
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.m,
        gap: SPACING.m,
    },
    cardPressed: {
        backgroundColor: COLORS.surfacePressed,
    },
    cover: {
        width: 84,
        aspectRatio: 2 / 3,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: COLORS.border,
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
    info: {
        flex: 1,
        justifyContent: "space-between",
    },
    title: {
        color: COLORS.text,
        fontSize: FONTSIZE.l,
        fontWeight: "700",
    },
    author: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.s,
        marginTop: SPACING.xs,
    },
    progressBlock: {
        gap: SPACING.xs,
    },
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    chapterText: {
        flex: 1,
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.xs,
    },
    percentText: {
        color: COLORS.primary,
        fontSize: FONTSIZE.m,
        fontWeight: "800",
    },
    track: {
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.border,
        overflow: "hidden",
    },
    fill: {
        height: "100%",
        borderRadius: 3,
        backgroundColor: COLORS.primary,
    },
})

export default ContinueReadingCard
