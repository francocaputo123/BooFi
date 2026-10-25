import { View, Text, Pressable, StyleSheet } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Draft } from "@/types/draft.types"
import { STATUS_LABELS } from "@/constants/draftOptions"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface DraftCardProps {
  draft: Draft
  onPress: () => void
  onDelete: () => void
}

/** Tarjeta de una historia con su estado, sus categorías y el botón de borrar */
const DraftCard = ({ draft, onPress, onDelete }: DraftCardProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={styles.header}>
      <Text style={styles.title}>{draft.title}</Text>
      <Pressable onPress={onDelete}>
        <Ionicons name="trash-outline" size={22} color={COLORS.dangerText} />
      </Pressable>
    </View>
    <Text style={styles.meta}>{STATUS_LABELS[draft.status]}</Text>
    {draft.tags && draft.tags.length > 0 && <Text style={styles.meta}>{draft.tags.join(" · ")}</Text>}
  </Pressable>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.m,
    marginTop: SPACING.s,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: COLORS.text,
    fontSize: FONTSIZE.m,
    fontWeight: "600",
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: FONTSIZE.xs,
    marginTop: SPACING.xs,
  },
})

export default DraftCard