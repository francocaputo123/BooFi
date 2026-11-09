import { View, StyleSheet } from "react-native"
import DraftList from "@/components/DraftList"
import { COLORS, SPACING } from "@/constants/theme"

/**
 * Lista de las historias del autor.
 * TODO: pestañas Publicadas y Borradores cuando se pueda saber qué historias están publicadas
 */
const MyStoriesScreen = () => (
  <View style={styles.container}>
    <DraftList />
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.m },
})

export default MyStoriesScreen