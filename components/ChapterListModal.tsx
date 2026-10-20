import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme";
import { READER_LABELS } from "@/data/readingData";
import { ChapterListModalProps } from "@/types/reading.types";

// Alto fijo de cada fila: permite abrir el listado ya posicionado en el capitulo actual
const ROW_HEIGHT = 52;

/**
 * Listado de capitulos del libro en un panel que sube desde abajo.
 * Tocar un capitulo avisa cual se eligio; el capitulo que se esta leyendo aparece resaltado.
 */
const ChapterListModal = ({ visible, chapters, currentIndex, onSelect, onClose }: ChapterListModalProps) => {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            {/* Tocar el fondo oscuro cierra el panel */}
            <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={READER_LABELS.CLOSE} />

            <View style={styles.sheet}>
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>{READER_LABELS.CHAPTER_LIST_TITLE} · {chapters.length}</Text>
                    <Pressable onPress={onClose} accessibilityLabel={READER_LABELS.CLOSE} hitSlop={8}>
                        <Ionicons name="close" size={24} color={COLORS.text} />
                    </Pressable>
                </View>

                <FlatList
                    data={chapters}
                    keyExtractor={(chapter) => chapter.id}
                    initialScrollIndex={Math.min(currentIndex, Math.max(chapters.length - 1, 0))}
                    getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
                    renderItem={({ item, index }) => {
                        const isCurrent = index === currentIndex
                        return (
                            <Pressable
                                style={[styles.row, isCurrent && styles.rowCurrent]}
                                onPress={() => onSelect(index)}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isCurrent }}
                            >
                                <Text style={[styles.rowText, isCurrent && styles.rowTextCurrent]} numberOfLines={1}>
                                    {index + 1}. {item.title}
                                </Text>
                                {isCurrent && <Ionicons name="bookmark" size={18} color={COLORS.primary} />}
                            </Pressable>
                        )
                    }}
                />
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
        maxHeight: "70%",
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: SPACING.l,
    },
    sheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    sheetTitle: {
        color: COLORS.text,
        fontSize: FONTSIZE.l,
        fontWeight: "700",
    },
    row: {
        height: ROW_HEIGHT,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: SPACING.s,
        paddingHorizontal: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    rowCurrent: {
        backgroundColor: COLORS.surface,
    },
    rowText: {
        flex: 1,
        color: COLORS.text,
        fontSize: FONTSIZE.s,
    },
    rowTextCurrent: {
        fontWeight: "700",
    },
})

export default ChapterListModal