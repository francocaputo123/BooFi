import { Pressable, StyleSheet, Text } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface PaidFilterChipProps {
    label: string
    selected: boolean
    onToggle: () => void
}

/**
 * Chip para prender/apagar el filtro "Solo de pago" en Explorar.
 * Se ve igual que los chips de genero: oscuro cuando esta activo.
 */
const PaidFilterChip = ({ label, selected, onToggle }: PaidFilterChipProps) => {
    return (
        <Pressable
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityState={{ selected }}
        >
            <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    chip: {
        alignSelf: "flex-start",
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
    },
    chipSelected: {
        backgroundColor: COLORS.text,
        borderColor: COLORS.text,
    },
    text: {
        color: COLORS.text,
        fontSize: FONTSIZE.s,
    },
    textSelected: {
        color: COLORS.background,
        fontWeight: "600",
    },
})

export default PaidFilterChip
