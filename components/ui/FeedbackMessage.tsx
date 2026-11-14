import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface FeedbackMessageProps {
    message: string
    isLoading?: boolean
    actionLabel?: string
    onAction?: () => void
}

/**
 * Mensaje centrado para los estados de una pantalla: cargando, error o sin resultados.
 * El boton aparece solo si se pasan actionLabel y onAction (ej. "Reintentar").
 */
const FeedbackMessage = ({ message, isLoading = false, actionLabel, onAction }: FeedbackMessageProps) => {
    return (
        <View style={styles.container}>
            {isLoading && <ActivityIndicator color={COLORS.primary} />}
            <Text style={styles.message}>{message}</Text>
            {actionLabel && onAction && (
                <Pressable style={styles.button} onPress={onAction} accessibilityRole="button">
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.m,
        padding: SPACING.l,
    },
    message: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.m,
        textAlign: "center",
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.s + 2,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: FONTSIZE.s,
        fontWeight: "600",
    },
})

export default FeedbackMessage
