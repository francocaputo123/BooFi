import { View, Text, Pressable, StyleSheet } from "react-native"
import { Draft } from "@/types/draft.types"
import { getDraftTitle } from "@/utils/getDraftTitle"
import DraftCover from "@/components/DraftCover"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

const COVER_WIDTH = 96
const COVER_HEIGHT = 128

interface LatestDraftCardProps {
  draft: Draft
  chapterCount: number
  onPress: () => void
}

/** Tarjeta destacada con la última historia en la que se escribió */
const LatestDraftCard = ({ draft, chapterCount, onPress }: LatestDraftCardProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <DraftCover draft={draft} width={COVER_WIDTH} height={COVER_HEIGHT} />
    <View style={styles.info}>
      <Text style={styles.label}>SEGUIR ESCRIBIENDO</Text>
      <Text style={styles.title} numberOfLines={2}>{getDraftTitle(draft)}</Text>
      <Text style={styles.chapter}>
        {chapterCount > 0 ? `Capítulo ${chapterCount}` : "Sin capítulos"}
      </Text>
      <Text style={styles.action}>Continuar →</Text>
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", gap: SPACING.m, backgroundColor: COLORS.surface,
    borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: SPACING.m,
  },
  info: { flex: 1, justifyContent: "center", gap: SPACING.xs },
  label: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary, letterSpacing: 1 },
  title: { fontSize: FONTSIZE.xl, fontWeight: "bold", color: COLORS.text },
  chapter: { fontSize: FONTSIZE.s, color: COLORS.textSecondary },
  action: { fontSize: FONTSIZE.s, color: COLORS.primary, marginTop: SPACING.xs },
})

export default LatestDraftCard