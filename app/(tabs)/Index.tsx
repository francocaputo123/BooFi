import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router'; 
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme";
import GenreChips from "@/components/ui/GenreChips"
import { ALL_GENRES_LABEL, BOOK_GENRES, CATALOG_LABELS, GRID_COLUMNS, GRID_GAP } from "@/data/catalogData"
import { useBookSearch } from "@/hooks/useBookSearch"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Index() {
  const router = useRouter(); 
  const { selectedGenre, setSelectedGenre } = useBookSearch();

  return (
    <View style={styles.container}>

      {/* Tags de exploración por género */}
      <View style={styles.exploreGenreContainer}>
        <Text style={styles.sectionTitle}>EXPLORAR POR GÉNERO</Text>
        <Pressable onPress={() => router.push('/Explore')}>
          <Text style={{color: COLORS.primary, fontSize: FONTSIZE.m}}>Ver todos</Text>
        </Pressable>
      </View>

      <View>
          <GenreChips
              genres={BOOK_GENRES}
              selected={selectedGenre}
              onSelect={setSelectedGenre}
              allLabel={ALL_GENRES_LABEL}
          />
      </View>

      {/* Botón de tienda */}
      {/* TODO: Agregar el link a la pantalla de tienda*/}
      
      <Pressable 
        style={({ pressed }) => [
          styles.mapButton,
          pressed && styles.btnPressed
        ]}
        onPress={() => router.push('')}
      >
        <View style={[styles.mapBtnIcon, styles.mapBtnIconShadow]}>
          <MaterialIcons name="local-grocery-store" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.mapBtnText}>
          <Text style={styles.mapBtnTitle}>Tienda</Text>
          <Text style={styles.mapBtnDescription}>Compra libros y apoya a sus autores</Text>
        </View>
        <View style={styles.mapBtnIcon} >
          <Ionicons name="chevron-forward" color="black" />
        </View>
      </Pressable>

      {/* Botón de mapa */}
      <Pressable 
        style={({ pressed }) => [
          styles.mapButton,
          pressed && styles.btnPressed
        ]}
        onPress={() => router.push('/Maps')}
      >
        <View style={[styles.mapBtnIcon, styles.mapBtnIconShadow]}>
          <Feather name="map-pin" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.mapBtnText}>
          <Text style={styles.mapBtnTitle}>Mapa</Text>
          <Text style={styles.mapBtnDescription}>Librerías y lugares cerca tuyo</Text>
        </View>
        <View style={styles.mapBtnIcon} >
          <Ionicons name="chevron-forward" color="black" />
        </View>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exploreGenreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.m,
  },
  chip: {
    backgroundColor: COLORS.accent,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTSIZE.xs,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: SPACING.l,
    marginBottom: SPACING.s,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.m,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.m,
    marginBottom: SPACING.s,
    marginHorizontal: SPACING.m, 
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
    backgroundColor: COLORS.surfacePressed,
  },
  mapBtnText: {
    flex: 1, 
  },
  mapBtnTitle: {
    color: COLORS.text,
    fontSize: FONTSIZE.m,
    fontWeight: "700",
  },
  mapBtnDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTSIZE.s,
    marginTop: 2,
  },
  mapBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mapBtnIconShadow: {
    backgroundColor: COLORS.primary + "10",
  }
});