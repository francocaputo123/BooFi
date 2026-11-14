import { Modal, View, Pressable, FlatList, StyleSheet } from "react-native"
import { Chapter } from "@/types/chapter.types"
import ChapterCard from "@/components/ChapterCard"
import { COLORS, SPACING } from "@/constants/theme"

interface ChapterPickerProps {
  visible: boolean
  chapters: Chapter[]
  currentChapterId: string
  onClose: () => void
  onSelect: (chapter: Chapter) => void
  onMove: (index: number, direction: -1 | 1) => void
  onDelete: (chapter: Chapter) => void
}

/** Desplegable bajo el encabezado con los capítulos de la historia: abrir, mover y borrar */
const ChapterPicker = ({
  visible, chapters, currentChapterId, onClose, onSelect, onMove, onDelete,
}: ChapterPickerProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.panel}>
        <FlatList
          data={chapters}
          keyExtractor={(chapter) => chapter.id}
          renderItem={({ item, index }) => (
            <ChapterCard
              chapter={item}
              position={index + 1}
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
      </View>
    </View>
  </Modal>
)

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.15)" },
  panel: {
    marginTop: 56, marginHorizontal: SPACING.m, maxHeight: "60%", padding: SPACING.s,
    backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    elevation: 8,
  },
})

export default ChapterPicker