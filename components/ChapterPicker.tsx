import { Modal, View, Text, Pressable, FlatList, StyleSheet } from "react-native"
import { Chapter } from "@/types/chapter.types"
import ChapterCard from "@/components/ChapterCard"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface ChapterPickerProps {
  visible: boolean
  chapters: Chapter[]
  currentChapterId: string
  onClose: () => void
  onSelect: (chapter: Chapter) => void
  onMove: (index: number, direction: -1 | 1) => void
  onDelete: (chapter: Chapter) => void
  onSettings: () => void
  onPreview: () => void
  onPublish: () => void
}

/** Panel inferior con los capítulos de la historia y los accesos a configurar, leer y publicar */
const ChapterPicker = ({
  visible, chapters, currentChapterId, onClose, onSelect, onMove, onDelete, onSettings, onPreview, onPublish,
}: ChapterPickerProps) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.panel}>
        <Text style={styles.title}>Capítulos</Text>

        <FlatList
          style={styles.list}
          data={chapters}
          keyExtractor={(chapter) => chapter.id}
          renderItem={({ item, index }) => (
            <ChapterCard
              chapter={item}
              isFirst={index === 0}
              isLast={index === chapters.length - 1}
              isCurrent={item.id === currentChapterId}
              onPress={() => onSelect(item)}
              onMoveUp={() => onMove(index, -1)}
              onMoveDown={() => onMove(index, 1)}
              onDelete={() => onDelete(item)}
            />
          )}
        />

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={onSettings}>
            <Text style={styles.secondaryButtonText}>Configuración de la historia</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onPreview}>
            <Text style={styles.secondaryButtonText}>Leer historia</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={onPublish}>
            <Text style={styles.primaryButtonText}>Publicar historia</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
)

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  panel: {
    backgroundColor: COLORS.background, borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: SPACING.m, maxHeight: "80%",
  },
  title: { fontSize: FONTSIZE.l, fontWeight: "bold", color: COLORS.text },
  list: { flexGrow: 0, marginVertical: SPACING.s },
  actions: { gap: SPACING.s, marginTop: SPACING.s },
  primaryButton: { backgroundColor: COLORS.primary, padding: SPACING.m, borderRadius: 8, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontSize: FONTSIZE.m },
  secondaryButton: {
    borderColor: COLORS.primary, borderWidth: 1, padding: SPACING.m,
    borderRadius: 8, alignItems: "center",
  },
  secondaryButtonText: { color: COLORS.primary, fontSize: FONTSIZE.m },
})

export default ChapterPicker