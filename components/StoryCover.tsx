import { View, Text, Image, StyleSheet } from "react-native"
import { COLORS, FONTSIZE } from "@/constants/theme"

interface StoryCoverProps {
  title: string
  coverUrl?: string | null
  width: number
  height: number
}

/** Portada de una historia; si no tiene, muestra la inicial del título */
const StoryCover = ({ title, coverUrl, width, height }: StoryCoverProps) => (
  <View style={[styles.cover, { width, height }]}>
    {coverUrl ? (
      <Image source={{ uri: coverUrl }} style={styles.image} resizeMode="cover" />
    ) : (
      <Text style={styles.initial}>{title.charAt(0).toUpperCase()}</Text>
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

export default StoryCover