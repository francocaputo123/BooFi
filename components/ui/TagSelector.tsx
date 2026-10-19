import { Pressable, StyleSheet, Text, View } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface TagSelectorProps {
    options: readonly string[]
    selected: string[]
    onToggle: (tag: string) => void
}

/**
 * Lista de categorias como chips seleccionables. Cada chip prende/apaga su categoria.
 * No maneja estado propio: el padre decide que esta seleccionado y que hacer al tocar.
 */
const TagSelector = ({ options, selected, onToggle }: TagSelectorProps) => {
    return (
        <View style={styles.container}>
            {options.map((tag) => {
                const isSelected = selected.includes(tag)
                return (
                    <Pressable
                        key={tag}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => onToggle(tag)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                    >
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {tag}
                        </Text>
                    </Pressable>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SPACING.s,
    },
    chip: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.s,
        fontWeight: "600",
    },
    chipTextSelected: {
        color: COLORS.background,
    },
})

export default TagSelector