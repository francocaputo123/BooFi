import { ComponentProps } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface ToolCardProps {
  icon: ComponentProps<typeof Ionicons>["name"]
  title: string
  subtitle: string
  onPress: () => void
  disabled?: boolean
}

/** Acceso rápido de la pantalla principal del editor, con icono, título y descripción */
const ToolCard = ({ icon, title, subtitle, onPress, disabled }: ToolCardProps) => (
  <Pressable
    style={[styles.card, disabled && styles.cardDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={22} color={COLORS.primary} />
    </View>
    <View style={styles.texts}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: SPACING.m, backgroundColor: COLORS.surface,
    borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: SPACING.m,
  },
  cardDisabled: { opacity: 0.5 },
  iconBox: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.background,
    alignItems: "center", justifyContent: "center",
  },
  texts: { flex: 1 },
  title: { fontSize: FONTSIZE.m, fontWeight: "600", color: COLORS.text },
  subtitle: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary },
})

export default ToolCard