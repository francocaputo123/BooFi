import { View, Text, Pressable, StyleSheet } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import StoryCover from "@/components/StoryCover"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

const COVER_WIDTH = 48
const COVER_HEIGHT = 72

interface StoryCardProps {
  title: string
  coverUrl?: string | null
  /* Línea de detalle bajo el título (capítulos, categorías...) */
  meta: string
  badgeLabel: string
  /* true pinta la etiqueta en verde (historia publicada) */
  isPublished?: boolean
  onPress: () => void
  /* Si se pasa, a la derecha va el botón de borrar en lugar de la flecha */
  onDelete?: () => void
}

/** Tarjeta de una historia de "Mis historias": portada, título, detalle y etiqueta de estado */
const StoryCard = ({ title, coverUrl, meta, badgeLabel, isPublished = false, onPress, onDelete }: StoryCardProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <StoryCover title={title} coverUrl={coverUrl} width={COVER_WIDTH} height={COVER_HEIGHT} />
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.meta} numberOfLines={1}>{meta}</Text>
      <View style={[styles.badge, isPublished && styles.badgePublished]}>
        <Text style={[styles.badgeText, isPublished && styles.badgeTextPublished]}>{badgeLabel}</Text>
      </View>
    </View>
    {onDelete ? (
      <Pressable onPress={onDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={22} color={COLORS.dangerText} />
      </Pressable>
    ) : (
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    )}
  </Pressable>
)

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: SPACING.m, marginTop: SPACING.m,
    backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1,
    borderRadius: 12, padding: SPACING.m,
  },
  info: { flex: 1, gap: SPACING.xs },
  title: { fontSize: FONTSIZE.m, fontWeight: "bold", color: COLORS.text },
  meta: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary },
  badge: {
    alignSelf: "flex-start", backgroundColor: COLORS.border,
    borderRadius: 4, paddingHorizontal: SPACING.s, paddingVertical: 2,
  },
  badgePublished: { backgroundColor: COLORS.success },
  badgeText: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary },
  badgeTextPublished: { color: COLORS.successText },
})

export default StoryCard