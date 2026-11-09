import { View, Text, Pressable, StyleSheet } from "react-native"
import { Draft } from "@/types/draft.types"
import { getDraftTitle } from "@/utils/getDraftTitle"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface LatestDraftCardProps {
  draft: Draft
  chapterCount: number
  onPress: () => void
}

/** Tarjeta destacada con la última historia en la que se escribió */
const LatestDraftCard = ({ draft, chapterCount, onPress }: LatestDraftCardProps) => {
  const title = getDraftTitle(draft)

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* TODO: reemplazar la inicial por la portada cuando exista (RF6.4) */}
      <View style={styles.cover}>
        <Text style={styles.coverInitial}>{title.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>SEGUIR ESCRIBIENDO</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.chapter}>
          {chapterCount > 0 ? `Capítulo ${chapterCount}` : "Sin capítulos"}
        </Text>
        <Text style={styles.action}>Continuar →</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", gap: SPACING.m, backgroundColor: COLORS.surface,
    borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: SPACING.m,
  },
  cover: {
    width: 96, height: 128, borderRadius: 8, backgroundColor: COLORS.background,
    borderColor: COLORS.border, borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  coverInitial: { fontSize: FONTSIZE.xl, fontWeight: "bold", color: COLORS.textSecondary },
  info: { flex: 1, justifyContent: "center", gap: SPACING.xs },
  label: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary, letterSpacing: 1 },
  title: { fontSize: FONTSIZE.xl, fontWeight: "bold", color: COLORS.text },
  chapter: { fontSize: FONTSIZE.s, color: COLORS.textSecondary },
  action: { fontSize: FONTSIZE.s, color: COLORS.primary, marginTop: SPACING.xs },
})

export default LatestDraftCard