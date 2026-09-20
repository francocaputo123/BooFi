import { View, ScrollView, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EpubChapter } from '../../types/epub.types';
import { EpubDetailScreenParams } from '../../types/epub';
import { SYNOPSIS_MOCK, RATING_MOCK, CATEGORIES_MOCK, COVER_MOCK } from '../../data/epubMock';
import { COLORS, SPACING, FONTSIZE } from '../../constants/theme';

/**
 * Pantalla de detalle de un EPUB. Solo se llega a ella tocando un libro
 * (por ahora, mediante el redirect que hace la pantalla de carga); no tiene
 * entrada propia ni botón de carga.
 */
const EpubDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams() as EpubDetailScreenParams;
  const { title, author, chapters } = params

  const bookChapters: EpubChapter[] | undefined = chapters ? JSON.parse(chapters) : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: SPACING.m }}>
        <View>
          <Image source={{ uri: COVER_MOCK }} style={styles.cover} />
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </Pressable>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.author}>{author}</Text>
        <Text style={styles.text}>⭐ {RATING_MOCK}</Text>

        <View style={styles.categoriesRow}>
          {CATEGORIES_MOCK.map((category) => (
            <Text key={category} style={styles.categoryTag}>{category}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>SINOPSIS</Text>
        <Text style={styles.synopsisText}>{SYNOPSIS_MOCK}</Text>

        <Pressable style={styles.readButton}>
          <Text style={styles.readButtonText}>Comenzar a leer</Text>
        </Pressable>

        {bookChapters && (
          <>
            <Text style={styles.sectionTitle}>CAPÍTULOS · {bookChapters.length}</Text>
            {bookChapters.map((chapter, index) => (
              <View key={chapter.id} style={styles.chapterRow}>
                <Text style={styles.text}>{index + 1}. {chapter.title}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  text: {
    color: COLORS.text,
    fontSize: FONTSIZE.s,
  },
  cover: {
    width: '100%',
    height: 260,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.m,
    borderRadius: SPACING.xs,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.m,
    left: SPACING.m,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING.s,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
    marginTop: SPACING.s,
  },
  categoryTag: {
    backgroundColor: COLORS.surface,
    color: COLORS.textSecondary,
    borderRadius: 14,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    fontSize: FONTSIZE.xs,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTSIZE.s,
    fontWeight: '600',
    marginTop: SPACING.l,
    marginBottom: SPACING.s,
  },
  title: {
    color: COLORS.text,
    fontSize: FONTSIZE.xl,
    fontWeight: '800',
    marginTop: SPACING.s,
    marginBottom: SPACING.s,
  },
  author: {
    color: COLORS.accent,
    fontSize: FONTSIZE.m,
    fontWeight: '400',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  synopsisText: {
    color: COLORS.textSecondary,
    fontSize: FONTSIZE.s,
    lineHeight: 20,
  },
  readButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: SPACING.s + 4,
    alignItems: 'center',
    marginTop: SPACING.l,
  },
  readButtonText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: FONTSIZE.m,
  },
  chapterRow: {
    paddingVertical: SPACING.s,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
});

export default EpubDetailScreen;