import { View, Text, Image, StyleSheet } from "react-native"
import { Draft } from "@/types/draft.types"
import { getDraftTitle } from "@/utils/getDraftTitle"
import { COLORS, FONTSIZE } from "@/constants/theme"

interface DraftCoverProps {
  draft: Draft
  width: number
  height: number
}

/** Portada de una historia; si no tiene, muestra la inicial del título */
const DraftCover = ({ draft, width, height }: DraftCoverProps) => (
  <View style={[styles.cover, { width, height }]}>
    {draft.coverUrl ? (
      <Image source={{ uri: draft.coverUrl }} style={styles.image} resizeMode="cover" />
    ) : (
      <Text style={styles.initial}>{getDraftTitle(draft).charAt(0).toUpperCase()}</Text>
    )}
  </View>
)

const styles = StyleSheet.create({
  cover: {
    borderRadius: 8, backgroundColor: COLORS.background, borderColor: COLORS.border,
    borderWidth: 1, alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  initial: { fontSize: FONTSIZE.xl, fontWeight: "bold", color: COLORS.textSecondary },
})

export default DraftCover