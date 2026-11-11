import { Text, View, StyleSheet, Pressable, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router'; 
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme";
import GenreChipsIndex from "@/components/ui/GenreChipsIndex";
import { BOOK_GENRES, CATALOG_LABELS, HOME_BOOKS_LIMIT, HOME_CARD_WIDTH } from "@/data/catalogData";
import { useBookSearch } from "@/hooks/useBookSearch";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '@/components/Card'
import BookCard from '@/components/BookCard'

export default function Index() {
  const router = useRouter(); 
  const { selectedGenre, setSelectedGenre, books, isLoading, errorMessage } = useBookSearch();
  // El catalogo ya viene ordenado del mas nuevo al mas viejo: alcanza con cortar los primeros
  const latestBooks = books.slice(0, HOME_BOOKS_LIMIT);
  
  useEffect(() => {
    if (selectedGenre) {
      router.push({
        pathname: "/Explore",
        params: { genreFromIndex: selectedGenre }
      });
    }
  }, [selectedGenre]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Últimas publicaciones: la tarjeta es la misma de Explorar, así el cartel de "Pago" sale solo */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{CATALOG_LABELS.HOME_SECTION_LATEST}</Text>
        <Pressable onPress={() => router.push('/Explore')}>
          <Text style={{color: COLORS.primary, fontSize: FONTSIZE.m}}>Ver todos</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.booksFeedback} />
      ) : latestBooks.length === 0 ? (
        // Si falla la carga y no hay libros se avisa el error; si simplemente no hay nada publicado, el mensaje vacío
        <Text style={[styles.feedbackText, styles.booksFeedback]}>
          {errorMessage || CATALOG_LABELS.HOME_EMPTY}
        </Text>
      ) : (
        <FlatList
          data={latestBooks}
          keyExtractor={(book) => book.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.booksList}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              width={HOME_CARD_WIDTH}
              onPress={() => router.push({ pathname: "/books/Details", params: { id: item.id } })}
            />
          )}
        />
      )}

      {/* Tags de exploración por género */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>EXPLORAR POR GÉNERO</Text>
        <Pressable onPress={() => router.push('/Explore')}>
          <Text style={{color: COLORS.primary, fontSize: FONTSIZE.m}}>Ver todos</Text>
        </Pressable>
      </View>

      <View style={styles.chipsContainer}>
          <GenreChipsIndex
              genres={BOOK_GENRES}
              selected={selectedGenre}
              onSelect={setSelectedGenre}
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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.m,
  },
  booksList: {
    paddingHorizontal: SPACING.m,
    gap: SPACING.m,
    marginTop: SPACING.s,
  },
  booksFeedback: {
    marginVertical: SPACING.l,
  },
  feedbackText: {
    color: COLORS.textSecondary,
    fontSize: FONTSIZE.m,
    textAlign: "center",
    paddingHorizontal: SPACING.m,
  },
  chipsContainer: {
    marginHorizontal: SPACING.m, 
    marginBottom: SPACING.xxl,
    marginTop: SPACING.s,
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
    marginBottom: SPACING.l,
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