import { Pressable, ScrollView, StyleSheet, Text } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface GenreChipsProps {
    genres: readonly string[]
    /* null = "Todos" */
    selected: string | null
    onSelect: (genre: string | null) => void
    allLabel: string
}

/**
 * Fila de chips con scroll horizontal para elegir UN genero (o "Todos").
 * El elegido se marca con fondo oscuro, como en el mockup.
 */
const GenreChips = ({ genres, selected, onSelect, allLabel }: GenreChipsProps) => {
    // "Todos" va primero y representa "sin filtro" (null), por eso no es un genero mas de la lista
    const options: { key: string; label: string; value: string | null }[] = [
        { key: "ALL", label: allLabel, value: null },
        ...genres.map((genre) => ({ key: genre, label: genre, value: genre })),
    ]

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            // Sin flexGrow: 0 el ScrollView horizontal se estira en vertical y empuja la grilla hacia abajo
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            {options.map((option) => {
                const isSelected = selected === option.value
                return (
                    <Pressable
                        key={option.key}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => onSelect(option.value)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                    >
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {option.label}
                        </Text>
                    </Pressable>
                )
            })}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 0,
    },
    content: {
        gap: SPACING.s,
        paddingVertical: SPACING.xs,
    },
    chip: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
    },
    chipSelected: {
        backgroundColor: COLORS.text,
        borderColor: COLORS.text,
    },
    chipText: {
        color: COLORS.text,
        fontSize: FONTSIZE.s,
    },
    chipTextSelected: {
        color: COLORS.background,
        fontWeight: "600",
    },
})

export default GenreChips
