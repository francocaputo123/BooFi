import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, useWindowDimensions, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

// theme
import { COLORS, SPACING, FONTSIZE } from '@/constants/theme';

// store
import authStore from '@/store/authStore';
import readingStore from '@/store/readingStore';

// services
import { fetchCatalogBooks } from '@/services/catalogService';
import { getUserPurchases } from '@/services/purchaseService';
import { fetchAllRemoteProgress } from '@/services/readingProgressService';

// utils
import { buildProgressKey, getReadingPercent } from '@/utils/readingProgress';
import { readingProgressSchema } from '@/schema/reading.schema';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

// components
import BookCard from '@/components/BookCard';

// types
import { CatalogBook } from '@/types/catalog.types';
import { ReadingProgress } from '@/types/reading.types';

type FilterTab = 'all' | 'reading' | 'purchased';

interface LibraryItem {
    book: CatalogBook;
    isReading: boolean;
    readingPercent: number;
    isPurchased: boolean;
    lastUpdated: number;
}

const GRID_GAP = 12;
const GRID_COLUMNS = 2;

const ProfileBooks = () => {
    const router = useRouter();
    const { width: screenWidth } = useWindowDimensions();
    const userId = authStore((state) => state.public_id);
    const progressByKey = readingStore((state) => state.progressByKey);

    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [catalogBooks, setCatalogBooks] = useState<CatalogBook[]>([]);
    const [remoteProgress, setRemoteProgress] = useState<ReadingProgress[]>([]);
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const [extraBooksById, setExtraBooksById] = useState<Record<string, CatalogBook>>({});

    const cardWidth = (screenWidth - (SPACING.m || 16) * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

    const loadData = useCallback(async () => {
        if (!userId) return;

        try {
            const [booksList, purchasesList, remoteList] = await Promise.all([
                fetchCatalogBooks().catch(() => [] as CatalogBook[]),
                getUserPurchases(userId).catch(() => []),
                fetchAllRemoteProgress(userId).catch(() => [] as ReadingProgress[]),
            ]);

            setCatalogBooks(booksList);
            setRemoteProgress(remoteList);

            const pIds = new Set(purchasesList.map((p) => p.bookId));
            setPurchasedIds(pIds);

            // Si hay libros comprados que no vinieron en el catalogo principal, los buscamos directamente
            const knownBookIds = new Set(booksList.map((b) => b.id));
            const missingPurchasedIds = Array.from(pIds).filter((id) => !knownBookIds.has(id));

            if (missingPurchasedIds.length > 0) {
                const fetchedExtras: Record<string, CatalogBook> = {};
                await Promise.all(
                    missingPurchasedIds.map(async (id) => {
                        try {
                            const snap = await getDoc(doc(db, "books", id));
                            if (snap.exists()) {
                                const d = snap.data();
                                fetchedExtras[id] = {
                                    id: snap.id,
                                    title: typeof d.title === "string" ? d.title : "Sin título",
                                    authorName: typeof d.authorName === "string" ? d.authorName : "Autor desconocido",
                                    coverUrl: typeof d.coverUrl === "string" ? d.coverUrl : null,
                                    tags: Array.isArray(d.tags) ? d.tags : [],
                                    visibility: d.visibility === "paid" ? "paid" : "public",
                                    price: typeof d.price === "number" ? d.price : null,
                                    chapterCount: Array.isArray(d.chapters) ? d.chapters.length : 0,
                                };
                            }
                        } catch (err) {
                            console.warn("[ProfileBooks] Error al obtener libro extra:", id, err);
                        }
                    })
                );
                setExtraBooksById(fetchedExtras);
            }
        } catch (error) {
            console.error("[ProfileBooks] Error cargando biblioteca del usuario:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadData();
    };

    // Unificamos el mapa de libros disponibles
    const allKnownBooksMap = useMemo(() => {
        const map = new Map<string, CatalogBook>();
        catalogBooks.forEach((b) => map.set(b.id, b));
        Object.values(extraBooksById).forEach((b) => map.set(b.id, b));
        return map;
    }, [catalogBooks, extraBooksById]);

    // Combinamos progreso remoto y local
    const libraryItems = useMemo<LibraryItem[]>(() => {
        if (!userId) return [];

        // 1. Mapeo de progreso de lectura mas reciente por libro
        const latestProgressByBook = new Map<string, ReadingProgress>();

        const considerProgress = (p: ReadingProgress) => {
            const existing = latestProgressByBook.get(p.bookId);
            if (!existing || Date.parse(p.updatedAt) > Date.parse(existing.updatedAt)) {
                latestProgressByBook.set(p.bookId, p);
            }
        };

        remoteProgress.forEach(considerProgress);

        const userPrefix = buildProgressKey(userId, "");
        Object.entries(progressByKey).forEach(([key, stored]) => {
            if (!key.startsWith(userPrefix)) return;
            const parsed = readingProgressSchema.safeParse(stored);
            if (parsed.success) {
                considerProgress(parsed.data);
            }
        });

        // 2. Todos los bookIds de interés (leyendo o comprados)
        const allRelevantBookIds = new Set<string>();
        latestProgressByBook.forEach((_, bookId) => allRelevantBookIds.add(bookId));
        purchasedIds.forEach((bookId) => allRelevantBookIds.add(bookId));

        const items: LibraryItem[] = [];

        allRelevantBookIds.forEach((bookId) => {
            const book = allKnownBooksMap.get(bookId);
            if (!book) return; // Si no existe en Firestore, se omite

            const progress = latestProgressByBook.get(bookId);
            const isReading = Boolean(progress);
            const readingPercent = progress ? getReadingPercent(progress.chapterIndex, book.chapterCount) : 0;
            const isPurchased = purchasedIds.has(bookId);

            let lastUpdated = 0;
            if (progress?.updatedAt) {
                lastUpdated = Date.parse(progress.updatedAt) || 0;
            }

            items.push({
                book,
                isReading,
                readingPercent,
                isPurchased,
                lastUpdated,
            });
        });

        // Ordenamos los más recientes primero
        items.sort((a, b) => b.lastUpdated - a.lastUpdated);

        return items;
    }, [userId, remoteProgress, progressByKey, purchasedIds, allKnownBooksMap]);

    // Filtramos según la pestaña activa
    const filteredItems = useMemo(() => {
        if (activeTab === 'reading') {
            return libraryItems.filter((item) => item.isReading);
        }
        if (activeTab === 'purchased') {
            return libraryItems.filter((item) => item.isPurchased);
        }
        return libraryItems;
    }, [libraryItems, activeTab]);

    const counts = useMemo(() => {
        const readingCount = libraryItems.filter((i) => i.isReading).length;
        const purchasedCount = libraryItems.filter((i) => i.isPurchased).length;
        return {
            all: libraryItems.length,
            reading: readingCount,
            purchased: purchasedCount,
        };
    }, [libraryItems]);

    return (
        <View style={styles.container}>
            {/* Pestañas de filtrado (Todos / Leyendo / Comprados) */}
            <View style={styles.tabContainer}>
                <Pressable
                    style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                        Todos ({counts.all})
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.tabButton, activeTab === 'reading' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('reading')}
                >
                    <Text style={[styles.tabText, activeTab === 'reading' && styles.tabTextActive]}>
                        Leyendo ({counts.reading})
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.tabButton, activeTab === 'purchased' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('purchased')}
                >
                    <Text style={[styles.tabText, activeTab === 'purchased' && styles.tabTextActive]}>
                        Comprados ({counts.purchased})
                    </Text>
                </Pressable>
            </View>

            {/* Contenido principal */}
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary || '#007AFF'} />
                    <Text style={styles.loadingText}>Cargando tu biblioteca...</Text>
                </View>
            ) : filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons 
                            name={activeTab === 'purchased' ? "card-outline" : "book-outline"} 
                            size={44} 
                            color={COLORS.primary || "#007AFF"} 
                        />
                    </View>
                    <Text style={styles.emptyTitle}>
                        {activeTab === 'reading'
                            ? "No estás leyendo ningún libro"
                            : activeTab === 'purchased'
                            ? "No has comprado ningún libro aún"
                            : "Tu biblioteca está vacía"}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                        {activeTab === 'reading'
                            ? "Comienza a leer cualquier libro del catálogo para seguir tu progreso aquí."
                            : activeTab === 'purchased'
                            ? "Los libros pagos que compres se guardarán en esta sección para que los leas cuando quieras."
                            : "Explora la comunidad de BooFi para encontrar grandes historias y comenzar a leer."}
                    </Text>
                    <Pressable
                        style={styles.exploreBtn}
                        onPress={() => router.push('/Explore')}
                    >
                        <Ionicons name="compass-outline" size={18} color="white" style={{ marginRight: 6 }} />
                        <Text style={styles.exploreBtnText}>Explorar historias</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.book.id}
                    numColumns={GRID_COLUMNS}
                    contentContainerStyle={styles.gridContent}
                    columnWrapperStyle={styles.gridRow}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                    }
                    renderItem={({ item }) => {
                        let badge: string | undefined = undefined;
                        let badgeColor: string | undefined = undefined;

                        if (activeTab === 'reading' || (item.isReading && !item.isPurchased)) {
                            badge = `${item.readingPercent}% leído`;
                            badgeColor = COLORS.primary || '#007AFF';
                        } else if (activeTab === 'purchased' || (item.isPurchased && !item.isReading)) {
                            badge = 'Comprado';
                            badgeColor = '#2E7D32';
                        } else if (item.isPurchased && item.isReading) {
                            badge = `Comprado · ${item.readingPercent}%`;
                            badgeColor = '#2E7D32';
                        }

                        return (
                            <View style={{ width: cardWidth }}>
                                <BookCard
                                    book={item.book}
                                    width={cardWidth}
                                    badge={badge}
                                    badgeColor={badgeColor}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/books/Details",
                                            params: { id: item.book.id }
                                        })
                                    }
                                />
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || '#F8F9FA',
    },

    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.m || 16,
        paddingVertical: 12,
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        gap: 8,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: '#F1F3F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonActive: {
        backgroundColor: COLORS.primary || '#007AFF',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#777777',
    },

    gridContent: {
        paddingHorizontal: SPACING.m || 16,
        paddingTop: 16,
        paddingBottom: 32,
    },
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F1FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text || '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#777777',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    exploreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary || '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    exploreBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ProfileBooks;
