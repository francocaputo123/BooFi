import { View, Text, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface CoverPickerProps {
  /* Portada actual: ruta local (recién elegida) o link de internet (ya guardada). null si no hay */
  coverUri: string | null
  /* true mientras se sube o se quita la portada: bloquea los botones y muestra una ruedita */
  isBusy?: boolean
  onPick: () => void
  onRemove: () => void
}

/** Tarjeta para elegir, cambiar o quitar la portada de una historia */
const CoverPicker = ({ coverUri, isBusy = false, onPick, onRemove }: CoverPickerProps) => (
  <View style={styles.card}>
    <Pressable style={styles.coverBox} onPress={onPick} disabled={isBusy}>
      {coverUri ? (
        <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
      ) : (
        <Ionicons name="image-outline" size={26} color={COLORS.primary} />
      )}
      {isBusy && (
        <View style={styles.busyOverlay}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </Pressable>

    <View style={styles.texts}>
      <Pressable onPress={onPick} disabled={isBusy}>
        <Text style={styles.title}>{coverUri ? "Cambiar portada" : "Agregar portada"}</Text>
        <Text style={styles.subtitle}>{coverUri ? "Tocá para elegir otra imagen" : "Opcional, la podés agregar después"}</Text>
      </Pressable>
      {coverUri && (
        <Pressable onPress={onRemove} disabled={isBusy}>
          <Text style={styles.removeText}>Quitar portada</Text>
        </Pressable>
      )}
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", gap: SPACING.m, alignItems: "center", backgroundColor: COLORS.surface,
    borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: SPACING.m,
  },
  coverBox: {
    width: 72, height: 108, borderRadius: 8, backgroundColor: COLORS.background,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  coverImage: { width: "100%", height: "100%" },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  texts: { flex: 1, gap: SPACING.s },
  title: { fontSize: FONTSIZE.m, fontWeight: "600", color: COLORS.text },
  subtitle: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary },
  removeText: { fontSize: FONTSIZE.s, color: COLORS.dangerText },
})

export default CoverPicker