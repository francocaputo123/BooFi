import { Modal, View, Text, Pressable, StyleSheet } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

export interface PopupMenuItem {
  label: string
  icon: IconName
  onPress: () => void
  /* Dibuja una línea separadora arriba del ítem */
  hasSeparator?: boolean
}

interface PopupMenuProps {
  visible: boolean
  items: PopupMenuItem[]
  onClose: () => void
}

/**
 * Menú flotante en la esquina superior derecha (el del botón ⋯ del encabezado).
 * NOTE: se cierra solo al elegir una opción, antes de ejecutarla: un Modal abierto tapa la pantalla siguiente
 * @param PopupMenuProps props : visibilidad, opciones y función para cerrar
 * @returns JSX.Element
 */
const PopupMenu = ({ visible, items, onClose }: PopupMenuProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <View style={styles.menu}>
        {items.map((item) => (
          <View key={item.label}>
            {item.hasSeparator && <View style={styles.separator} />}
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => {
                onClose()
                item.onPress()
              }}
            >
              <Ionicons name={item.icon} size={20} color={COLORS.text} />
              <Text style={styles.itemText}>{item.label}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </Pressable>
  </Modal>
)

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.15)", alignItems: "flex-end" },
  menu: {
    marginTop: 56, marginRight: SPACING.s, minWidth: 220,
    backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: SPACING.xs, elevation: 8,
  },
  item: { flexDirection: "row", alignItems: "center", gap: SPACING.m, paddingVertical: SPACING.m - 2, paddingHorizontal: SPACING.m },
  itemPressed: { backgroundColor: COLORS.surfacePressed },
  itemText: { fontSize: FONTSIZE.m, color: COLORS.text },
  separator: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
})

export default PopupMenu