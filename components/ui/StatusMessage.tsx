import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme";
import { StatusMessageProps } from "@/types/ui.types";

/**
 * Mensaje centrado para los estados de Loading y Error de una pantalla.
 */
const StatusMessage = ({ message, isLoading = false, actionLabel, onAction }: StatusMessageProps) => {
    return (
        <View style={styles.container}>
            {isLoading && <ActivityIndicator color={COLORS.primary} />}
            <Text style={styles.message}>{message}</Text>
            {actionLabel && onAction && (
                <Pressable style={styles.button} onPress={onAction}>
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
        padding: SPACING.l,
        gap: SPACING.m,
    },
    message: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.s,
        textAlign: "center",
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
    },
    buttonText: {
        color: COLORS.background,
        fontWeight: "600",
    },
})

export default StatusMessage
