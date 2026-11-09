import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChapterReader from '@/components/ChapterReader';
import StatusMessage from '@/components/ui/StatusMessage';
import { COLORS } from '@/constants/theme';
import { READER_LABELS } from '@/data/readingData';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { bookRouteParamsSchema } from '@/schema/reading.schema';
import bookStore from '@/store/bookStore';
import { ReaderScreenParams } from '@/types/reading.types';

/**
 * Pantalla de lectura. Se abre desde la ficha del libro y retoma
 * el capítulo y el scroll donde el usuario quedó.
 */
const ReaderScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams() as ReaderScreenParams;

  const parsedParams = bookRouteParamsSchema.safeParse(params);
  const bookId = parsedParams.success ? parsedParams.data.id : '';

  const book = bookStore((state) => state.booksById[bookId]);
  // Solo los libros publicados sincronizan el progreso con la nube (RF5.1 CA3 / RF5.4)
  const { progress, isReady, savePosition } = useReadingProgress(bookId, book?.isPublished === true);

  const renderContent = () => {
    if (!isReady) {
      return <StatusMessage isLoading message={READER_LABELS.LOADING_PROGRESS} />;
    }

    if (!book) {
      return (
        <StatusMessage
          message={READER_LABELS.BOOK_NOT_FOUND}
          actionLabel={READER_LABELS.BACK}
          onAction={() => router.back()}
        />
      );
    }

    return (
      <ChapterReader
        book={book}
        initialProgress={progress}
        onSavePosition={savePosition}
        onBack={() => router.back()}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default ReaderScreen;
