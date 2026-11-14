import { Pressable, Text, StyleSheet } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface ChipOptionProps {
  label: string
  isSelected: boolean
  onPress: () => void
}

/** Botón con forma de chip que se resalta cuando está seleccionado */
const ChipOption = ({ label, isSelected, onPress }: ChipOptionProps) => (
  <Pressable style={[styles.chip, isSelected && styles.chipSelected]} onPress={onPress}>
    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
)

const styles = StyleSheet.create({
  chip: {
    paddingVertical: SPACING.s, paddingHorizontal: SPACING.m, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTSIZE.s, color: COLORS.text },
  chipTextSelected: { color: "#fff" },
})

export default ChipOption