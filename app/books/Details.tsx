import { useEffect } from 'react';
import { View, ScrollView, Text, Image, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EpubDetailScreenParams } from '../../types/epub';
import { SYNOPSIS_MOCK, RATING_MOCK, CATEGORIES_MOCK, COVER_MOCK } from '../../data/epubMock';
import { READER_LABELS } from '../../data/readingData';
import { COLORS, SPACING, FONTSIZE } from '../../constants/theme';
import StatusMessage from '../../components/ui/StatusMessage';
import bookStore from '../../store/bookStore';
import authStore from '../../store/authStore';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useAuthorName } from '../../hooks/useAuthorName';
import { usePublishedBook } from '../../hooks/usePublishedBook';
import { useBookAccess } from '../../hooks/useBookAccess';
import { recordBookPurchase } from '../../services/purchaseService';
import { bookRouteParamsSchema } from '../../schema/reading.schema';
import { getReadButtonLabel } from '../../utils/readingProgress';
import { clampChapterIndex, formatChapterCounter } from '../../utils/chapterNavigation';
import { ACCESS_LABELS } from '../../constants/chapterAccess';
import { formatPrice } from '../../utils/formatPrice';


/**
 * Pantalla de detalle de un libro. Se llega tocando un libro:
 * - desde el Editor (EPUB recién cargado o historia escrita), que ya está en bookStore
 * - desde Explorar (libro publicado), que se baja de Firestore con usePublishedBook
 */
const EpubDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams() as EpubDetailScreenParams;

  const parsedParams = bookRouteParamsSchema.safeParse(params);
  const bookId = parsedParams.success ? parsedParams.data.id : '';

  const book = bookStore((state) => state.booksById[bookId]);
  const currentUserId = authStore((state) => state.public_id);
  const { progress, isReady } = useReadingProgress(bookId, book?.isPublished === true);
  const { isLoadingBook, loadErrorMessage } = usePublishedBook(bookId);
  const { hasAccess, isCheckingAccess, isPaid, isPurchased, refreshAccess } = useBookAccess(bookId, book);
  // El autor que se muestra en un libro sin publicar es el usuario logueado, no el author del epub
  const loggedUserName = useAuthorName();

  useEffect(() => {
    const queryParams = params as Record<string, string | undefined>;
    const status = queryParams.collection_status || queryParams.status;
    const paymentId = queryParams.payment_id;

    if (status === 'approved' && currentUserId && book && !hasAccess) {
      recordBookPurchase(currentUserId, {
        bookId,
        title: book.title,
        price: book.price ?? 0,
        currency: 'ARS',
        paymentId,
      }).then(() => {
        refreshAccess();
        Alert.alert(
          '¡Pago aprobado!',
          `Tu compra de "${book.title}" fue acreditada con éxito. ¡Ya podés leerlo!`
        );
      });
      return;
    }

    if (status === 'rejected') {
      Alert.alert(
        'Pago rechazado',
        'El pago no se pudo completar. No se realizó ningún cargo a tu cuenta.'
      );
      return;
    }

    if (status === 'in_process' || status === 'pending') {
      Alert.alert(
        'Pago pendiente',
        'El pago está en proceso de acreditación. Apenas se confirme, tu libro quedará desbloqueado.'
      );
    }
  }, [params, currentUserId, book, hasAccess, bookId, refreshAccess]);

  const handleReadPress = () => {
    router.push({ pathname: '/books/Reader', params: { id: bookId } });
  };

  const handlePayPress = () => {
    router.push({ pathname: '/books/Checkout', params: { id: bookId } });
  };

  const handlePublishPress = () => {
    router.push({ pathname: '/books/Publish', params: { id: bookId } });
  };

  if (!isReady || isLoadingBook || !book) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        {!isReady || isLoadingBook ? (
          <StatusMessage
            isLoading
            message={isLoadingBook ? READER_LABELS.LOADING_BOOK : READER_LABELS.LOADING_PROGRESS}
          />
        ) : (
          <StatusMessage
            message={loadErrorMessage || READER_LABELS.BOOK_NOT_FOUND}
            actionLabel={READER_LABELS.BACK}
            onAction={() => router.back()}
          />
        )}
      </SafeAreaView>
    );
  }

  const { title, chapters: bookChapters, synopsis, coverUri } = book;
  const categories = book.tags?.length ? book.tags : CATEGORIES_MOCK;
  // En un libro publicado el autor es el que firmó al publicar; si no, el usuario logueado
  const authorName = book.isPublished ? book.author : loggedUserName;


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
          {categories.map((category) => (
            <Text key={category} style={styles.categoryTag}>{category}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>SINOPSIS</Text>
        <Text style={styles.synopsisText}>{synopsis || SYNOPSIS_MOCK}</Text>

        {isPaid && !hasAccess && (
          <View style={styles.paidNotice}>
            <Ionicons name="pricetag-outline" size={16} color={COLORS.primary} />
            <Text style={styles.paidNoticeText}>
              {book.price ? `Libro de pago · ${formatPrice(book.price)}` : 'Libro de pago'}
            </Text>
          </View>
        )}

        {isPurchased && (
          <View style={styles.purchasedNotice}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.successText} />
            <Text style={styles.purchasedNoticeText}>Libro comprado</Text>
          </View>
        )}

        {!hasAccess ? (
          <Pressable
            style={styles.payButton}
            onPress={handlePayPress}
            disabled={isCheckingAccess}
          >
            {isCheckingAccess ? (
              <ActivityIndicator color={COLORS.background} size="small" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={20} color={COLORS.background} />
                <Text style={styles.payButtonText}>
                  {book.price ? `Ir a pagar · ${formatPrice(book.price)}` : 'Ir a pagar'}
                </Text>
              </>
            )}
          </Pressable>
        ) : (
          <Pressable style={styles.readButton} onPress={handleReadPress}>
            <Text style={styles.readButtonText}>{getReadButtonLabel(progress)}</Text>
          </Pressable>
        )}

        {/* Publicar vive en su propia pantalla: ahi se edita la ficha tecnica antes de subir a Firebase.
            Si el libro ya está publicado, el botón no tiene sentido y se oculta */}
        {!book.isPublished && (
          <Pressable style={styles.publishButton} onPress={handlePublishPress}>
            <Text style={styles.publishButtonText}>Publicar</Text>
          </Pressable>
        )}

        {/* Solo si ya empezó: le dice dónde quedó sin tener que abrir el lector */}
        {progress && (
          <Text style={styles.progressText}>
            {formatChapterCounter(clampChapterIndex(progress.chapterIndex, bookChapters.length), bookChapters.length)}
          </Text>
        )}

        <Text style={styles.sectionTitle}>CAPÍTULOS · {bookChapters.length}</Text>
        {bookChapters.map((chapter, index) => (
          <View key={chapter.id} style={styles.chapterRow}>
            <Text style={[styles.text, styles.chapterTitle]}>{index + 1}. {chapter.title}</Text>
            {chapter.access && (
              <Text style={styles.accessTag}>
                {ACCESS_LABELS[chapter.access]}
              </Text>
            )}
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
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: SPACING.s + 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.s,
    marginTop: SPACING.l,
  },
  payButtonText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: FONTSIZE.m,
  },
  paidNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.m,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs + 2,
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.xs,
    alignSelf: 'flex-start',
  },
  paidNoticeText: {
    color: COLORS.primary,
    fontSize: FONTSIZE.s,
    fontWeight: '600',
  },
  purchasedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.m,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs + 2,
    backgroundColor: COLORS.success,
    borderRadius: SPACING.xs,
    alignSelf: 'flex-start',
  },
  purchasedNoticeText: {
    color: COLORS.successText,
    fontSize: FONTSIZE.s,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.s,
  },
  chapterTitle: { flex: 1 },
  accessTag: {
    backgroundColor: COLORS.surface,
    color: COLORS.textSecondary,
    borderRadius: 14,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    fontSize: FONTSIZE.xs,
  },
});

export default EpubDetailScreen;