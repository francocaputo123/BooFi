import { View, ScrollView, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EpubDetailScreenParams } from '../../types/epub';
import { SYNOPSIS_MOCK, RATING_MOCK, CATEGORIES_MOCK, COVER_MOCK } from '../../data/epubMock';
import { READER_LABELS } from '../../data/readingData';
import { COLORS, SPACING, FONTSIZE } from '../../constants/theme';
import StatusMessage from '../../components/ui/StatusMessage';
import bookStore from '../../store/bookStore';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useAuthorName } from '../../hooks/useAuthorName';
import { bookRouteParamsSchema } from '../../schema/reading.schema';
import { getReadButtonLabel } from '../../utils/readingProgress';
import { clampChapterIndex, formatChapterCounter } from '../../utils/chapterNavigation';

/**
 * Pantalla de detalle de un EPUB. Solo se llega a ella tocando un libro
 * (por ahora, mediante el redirect que hace la pantalla de carga); no tiene
 * entrada propia ni botón de carga. 
 */
const EpubDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams() as EpubDetailScreenParams;

  const parsedParams = bookRouteParamsSchema.safeParse(params);
  const bookId = parsedParams.success ? parsedParams.data.id : '';

  const book = bookStore((state) => state.booksById[bookId]);
  const { progress, isReady } = useReadingProgress(bookId);
  // El autor que se muestra es el usuario logueado, no el author del epub
  const authorName = useAuthorName();

  const handleReadPress = () => {
    router.push({ pathname: '/books/Reader', params: { id: bookId } });
  };

  const handlePublishPress = () => {
    router.push({ pathname: '/books/Publish', params: { id: bookId } });
  };

  if (!isReady || !book) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        {!isReady ? (
          <StatusMessage isLoading message={READER_LABELS.LOADING_PROGRESS} />
        ) : (
          <StatusMessage
            message={READER_LABELS.BOOK_NOT_FOUND}
            actionLabel={READER_LABELS.BACK}
            onAction={() => router.back()}
          />
        )}
      </SafeAreaView>
    );
  }

  const { title, chapters: bookChapters, synopsis, coverUri } = book;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: SPACING.m }}>
        <View>
          <Image source={{ uri: coverUri ?? COVER_MOCK }} style={styles.cover} resizeMode="contain" />
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </Pressable>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.author}>{authorName}</Text>
        <Text style={styles.text}>⭐ {RATING_MOCK}</Text>

        <View style={styles.categoriesRow}>
          {CATEGORIES_MOCK.map((category) => (
            <Text key={category} style={styles.categoryTag}>{category}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>SINOPSIS</Text>
        <Text style={styles.synopsisText}>{synopsis || SYNOPSIS_MOCK}</Text>

        <Pressable style={styles.readButton} onPress={handleReadPress}>
          <Text style={styles.readButtonText}>{getReadButtonLabel(progress)}</Text>
        </Pressable>

        {/* Publicar vive en su propia pantalla: ahi se edita la ficha tecnica antes de subir a Firebase */}
        <Pressable style={styles.publishButton} onPress={handlePublishPress}>
          <Text style={styles.publishButtonText}>Publicar</Text>
        </Pressable>

        {/* Solo si ya empezó: le dice dónde quedó sin tener que abrir el lector */}
        {progress && (
          <Text style={styles.progressText}>
            {formatChapterCounter(clampChapterIndex(progress.chapterIndex, bookChapters.length), bookChapters.length)}
          </Text>
        )}

        <Text style={styles.sectionTitle}>CAPÍTULOS · {bookChapters.length}</Text>
        {bookChapters.map((chapter, index) => (
          <View key={chapter.id} style={styles.chapterRow}>
            <Text style={styles.text}>{index + 1}. {chapter.title}</Text>
          </View>
        ))}
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
  // Proporcion de libro (2:3) y centrada: asi no se recorta la portada y se ve entera
  cover: {
    width: '60%',
    aspectRatio: 2 / 3,
    alignSelf: 'center',
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
  publishButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: SPACING.s + 4,
    alignItems: 'center',
    marginTop: SPACING.s,
  },
  publishButtonText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: FONTSIZE.m,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: FONTSIZE.xs,
    textAlign: 'center',
    marginTop: SPACING.s,
  },
  chapterRow: {
    paddingVertical: SPACING.s,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
});

export default EpubDetailScreen;