import { Pressable, ScrollView, StyleSheet, Text } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface GenreChipsPropsIndex {
    genres: readonly string[]
    /* null = "Todos" */
    selected: string | null
    onSelect: (genre: string | null) => void
}


/* Tags para la pantalla home, similar al componente "GenreChips", sin que sea necesario pasar el label "Todos" */
const GenreChipsIndex = ({ genres, selected, onSelect }: GenreChipsPropsIndex) => {

    const optionsIndex: { key: string; label: string; value: string | null }[] = [
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
            {optionsIndex.map((option) => {
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
        backgroundColor: COLORS.surface,
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

export default GenreChipsIndex