import { useEffect, useState } from "react"
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import { MAX_SYNOPSIS_LENGTH, PUBLISH_LABELS } from "@/data/publishData"

interface SynopsisEditModalProps {
    visible: boolean
    initialValue: string
    onSave: (value: string) => void
    onClose: () => void
}

/**
 * Panel que sube desde abajo para escribir la sinopsis.
 * Arranca con el valor actual del padre y guarda el texto al confirmar.
 * El campo respeta el largo maximo que acepta el schema de publicacion.
 */
const SynopsisEditModal = ({ visible, initialValue, onSave, onClose }: SynopsisEditModalProps) => {
    const [draft, setDraft] = useState(initialValue)

    // Cada vez que se abre, arranca con lo que el padre tenga como valor actual
    useEffect(() => {
        if (visible) setDraft(initialValue)
    }, [visible, initialValue])

    const handleSave = () => {
        onSave(draft.trim())
        onClose()
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardView}
            >
                <View style={styles.sheet}>
                    <Text style={styles.title}>{PUBLISH_LABELS.FIELD_SYNOPSIS}</Text>

                    <TextInput
                        style={styles.input}
                        value={draft}
                        onChangeText={setDraft}
                        placeholder={PUBLISH_LABELS.SYNOPSIS_PLACEHOLDER}
                        placeholderTextColor={COLORS.textSecondary}
                        multiline
                        textAlignVertical="top"
                        maxLength={MAX_SYNOPSIS_LENGTH}
                        autoFocus
                    />

                    <Text style={styles.counter}>
                        {draft.length} / {MAX_SYNOPSIS_LENGTH}
                    </Text>

                    <View style={styles.buttons}>
                        <Pressable
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            accessibilityRole="button"
                        >
                            <Text style={styles.cancelText}>{PUBLISH_LABELS.CANCEL}</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                            accessibilityRole="button"
                        >
                            <Text style={styles.saveText}>{PUBLISH_LABELS.SAVE}</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    keyboardView: {
        // El sheet acompaña al teclado: sin esto el input queda tapado abajo
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: SPACING.m,
        paddingBottom: SPACING.l,
    },
    title: {
        color: COLORS.text,
        fontSize: FONTSIZE.l,
        fontWeight: "700",
        marginBottom: SPACING.m,
    },
    input: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        fontSize: FONTSIZE.s,
        lineHeight: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.m,
        minHeight: 160,
    },
    counter: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.xs,
        textAlign: "right",
        marginTop: SPACING.xs,
    },
    buttons: {
        flexDirection: "row",
        gap: SPACING.s,
        marginTop: SPACING.m,
    },
    button: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: SPACING.s + 4,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontWeight: "700",
        fontSize: FONTSIZE.m,
    },
    saveText: {
        color: COLORS.background,
        fontWeight: "700",
        fontSize: FONTSIZE.m,
    },
})

export default SynopsisEditModal