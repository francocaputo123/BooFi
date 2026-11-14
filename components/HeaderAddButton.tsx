import { Pressable } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { COLORS } from "@/constants/theme"

const ICON_SIZE = 26

interface HeaderAddButtonProps {
  onPress: () => void
  disabled?: boolean
}

/** Botón "+" del encabezado: el mismo diseño en el editor y en Mis historias */
const HeaderAddButton = ({ onPress, disabled = false }: HeaderAddButtonProps) => (
  <Pressable onPress={onPress} disabled={disabled} hitSlop={8}>
    <Ionicons name="add" size={ICON_SIZE} color={disabled ? COLORS.border : COLORS.primary} />
  </Pressable>
)

export default HeaderAddButton