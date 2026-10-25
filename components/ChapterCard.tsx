import { View, Text, Pressable, StyleSheet } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Chapter } from "@/types/chapter.types"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface ChapterCardProps {
  chapter: Chapter
  isFirst: boolean
  isLast: boolean
  onPress: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

/** Fila de un capítulo con acceso al editor y botones para reordenar o borrar */
const ChapterCard = ({ chapter, isFirst, isLast, onPress, onMoveUp, onMoveDown, onDelete }: ChapterCardProps) => (
  <View style={styles.card}>
    <Pressable style={styles.titleArea} onPress={onPress}>
      <Text style={styles.title}>{chapter.title}</Text>
    </Pressable>
    <View style={styles.actions}>
      <Pressable onPress={onMoveUp} disabled={isFirst}>
        <Ionicons name="arrow-up" size={22} color={isFirst ? COLORS.border : COLORS.text} />
      </Pressable>
      <Pressable onPress={onMoveDown} disabled={isLast}>
        <Ionicons name="arrow-down" size={22} color={isLast ? COLORS.border : COLORS.text} />
      </Pressable>
      <Pressable onPress={onDelete}>
        <Ionicons name="trash-outline" size={22} color={COLORS.dangerText} />
      </Pressable>
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1,
    borderRadius: 8, padding: SPACING.m, marginTop: SPACING.s,
  },
  titleArea: { flex: 1 },
  title: { fontSize: FONTSIZE.m, color: COLORS.text },
  actions: { flexDirection: "row", gap: SPACING.m },
})

export default ChapterCard