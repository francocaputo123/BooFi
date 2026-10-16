import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme";
import { READER_LABELS } from "@/data/readingData";
import { ChapterNavigationBarProps } from "@/types/reading.types";

/**
 * Controles de capitulo anterior / siguiente (US-5.2), con un boton en el medio
 * para abrir el listado de capitulos.
 * Anterior / Siguiente se deshabilitan cuando no hay capitulo en esa direccion.
 */
const ChapterNavigationBar = ({ navigation, onPrevious, onNext, onOpenList }: ChapterNavigationBarProps) => {
    const isPreviousDisabled = navigation.previousIndex === null
    const isNextDisabled = navigation.nextIndex === null

    return (
        <View style={styles.container}>
            <Pressable
                style={[styles.button, isPreviousDisabled && styles.buttonDisabled]}
                onPress={onPrevious}
                disabled={isPreviousDisabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: isPreviousDisabled }}
            >
                <Ionicons name="chevron-back" size={18} color={COLORS.background} />
                <Text style={styles.buttonText}>{READER_LABELS.PREVIOUS_CHAPTER}</Text>
            </Pressable>

            <Pressable
                style={styles.listButton}
                onPress={onOpenList}
                accessibilityRole="button"
                accessibilityLabel={READER_LABELS.OPEN_CHAPTER_LIST}
            >
                <Ionicons name="menu" size={22} color={COLORS.background} />
            </Pressable>

            <Pressable
                style={[styles.button, isNextDisabled && styles.buttonDisabled]}
                onPress={onNext}
                disabled={isNextDisabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: isNextDisabled }}
            >
                <Text style={styles.buttonText}>{READER_LABELS.NEXT_CHAPTER}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.background} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: SPACING.m,
        padding: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.background,
    },
    button: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.xs,
        backgroundColor: COLORS.secondary,
        borderRadius: 10,
        paddingVertical: SPACING.s + 4,
    },
    listButton: {
        // Cuadrado y de ancho fijo: Anterior y Siguiente se reparten el resto del espacio
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingHorizontal: SPACING.m,
    },
    buttonDisabled: {
        // Se atenua en vez de ocultarse para que el usuario vea que llegó al borde del libro
        opacity: 0.35,
    },
    buttonText: {
        color: COLORS.background,
        fontWeight: "700",
        fontSize: FONTSIZE.m,
    },
})

export default ChapterNavigationBar