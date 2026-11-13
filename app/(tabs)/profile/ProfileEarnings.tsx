import { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    Pressable, 
    ActivityIndicator, 
    Alert, 
    Image, 
    RefreshControl 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// theme
import { COLORS, SPACING, FONTSIZE } from '@/constants/theme';

// store
import authStore from '@/store/authStore';

// services
import { fetchAuthorEarnings, AuthorEarningsData } from '@/services/earningsService';

// utils
import { formatPrice } from '@/utils/formatPrice';

const ProfileEarnings = () => {
    const router = useRouter();
    const userId = authStore((state) => state.public_id);

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [earningsData, setEarningsData] = useState<AuthorEarningsData | null>(null);

    const loadEarnings = useCallback(async () => {
        if (!userId) return;

        try {
            const data = await fetchAuthorEarnings(userId);
            setEarningsData(data);
        } catch (error) {
            console.error("[ProfileEarnings] Error al cargar ganancias:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        loadEarnings();
    }, [loadEarnings]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadEarnings();
    };

    const handleCheckout = () => {
        Alert.alert(
            "Retiro de fondos",
            "La pasarela bancaria para transferir tus ganancias está en proceso de integración. ¡Tus fondos acumulados están registrados y protegidos en tu cuenta de BooFi! Te avisaremos cuando los cobros estén habilitados.",
            [{ text: "Entendido", style: "default" }]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary || '#007AFF'} />
                <Text style={styles.loadingText}>Cargando balance de ganancias...</Text>
            </View>
        );
    }

    const data = earningsData || {
        totalGross: 0,
        appFee: 0,
        authorNet: 0,
        totalSalesCount: 0,
        paidBooksCount: 0,
        bestSeller: null,
        recentSales: [],
        hasPaidBooks: false,
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
        >
            {/* 1. Tarjeta Principal de Saldo Disponible */}
            <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                    <View style={styles.balanceIconWrapper}>
                        <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.balanceTitle}>Saldo disponible</Text>
                </View>

                <Text style={styles.balanceAmount}>{formatPrice(data.authorNet)}</Text>

                <Text style={styles.balanceDescription}>
                    {data.authorNet > 0
                        ? "Monto acumulado listo para ser cobrado por las ventas de tus libros."
                        : "Aún no tienes ganancias acumuladas por ventas."}
                </Text>

                {/* Botón de Checkout / Retiro (no funcional por ahora) */}
                <Pressable
                    style={({ pressed }) => [
                        styles.checkoutBtn,
                        pressed && styles.btnPressed
                    ]}
                    onPress={handleCheckout}
                >
                    <Ionicons name="card-outline" size={18} color={COLORS.primary || '#007AFF'} style={{ marginRight: 8 }} />
                    <Text style={styles.checkoutBtnText}>Retirar ganancias</Text>
                </Pressable>
            </View>

            {/* 2. Desglose de ingresos (30% BooFi / 70% Autor) */}
            <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                    <Ionicons name="pie-chart-outline" size={20} color={COLORS.primary || '#007AFF'} />
                    <Text style={styles.cardTitle}>Desglose de ingresos</Text>
                </View>

                <Text style={styles.cardSubtitle}>
                    BooFi retiene el 30% por costos de procesamiento y plataforma, y tú recibes el 70% neto.
                </Text>

                {/* Barra de proporción visual 70% vs 30% */}
                <View style={styles.ratioBarContainer}>
                    <View style={[styles.ratioBarShare, { flex: 7, backgroundColor: '#2E7D32' }]}>
                        <Text style={styles.ratioBarText}>70% Tú</Text>
                    </View>
                    <View style={[styles.ratioBarShare, { flex: 3, backgroundColor: '#9E9E9E' }]}>
                        <Text style={styles.ratioBarText}>30% App</Text>
                    </View>
                </View>

                <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Ventas brutas totales</Text>
                    <Text style={styles.breakdownValue}>{formatPrice(data.totalGross)}</Text>
                </View>

                <View style={styles.breakdownRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.dot, { backgroundColor: '#9E9E9E' }]} />
                        <Text style={styles.breakdownLabel}>Comisión BooFi (30%)</Text>
                    </View>
                    <Text style={[styles.breakdownValue, { color: '#D32F2F' }]}>
                        - {formatPrice(data.appFee)}
                    </Text>
                </View>

                <View style={[styles.breakdownRow, styles.breakdownRowHighlight]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.dot, { backgroundColor: '#2E7D32' }]} />
                        <Text style={[styles.breakdownLabel, { fontWeight: '700', color: '#1A1A1A' }]}>
                            Tus ganancias netas (70%)
                        </Text>
                    </View>
                    <Text style={[styles.breakdownValue, { color: '#2E7D32', fontWeight: '700', fontSize: 16 }]}>
                        {formatPrice(data.authorNet)}
                    </Text>
                </View>
            </View>

            {/* 3. Libro más vendido */}
            <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                    <Ionicons name="trophy-outline" size={20} color="#F57C00" />
                    <Text style={styles.cardTitle}>Libro más vendido</Text>
                </View>

                {data.bestSeller && data.bestSeller.salesCount > 0 ? (
                    <Pressable
                        style={({ pressed }) => [
                            styles.bestSellerContainer,
                            pressed && styles.btnPressed
                        ]}
                        onPress={() =>
                            router.push({
                                pathname: "/books/Details",
                                params: { id: data.bestSeller!.bookId }
                            })
                        }
                    >
                        <View style={styles.coverWrapper}>
                            {data.bestSeller.coverUrl ? (
                                <Image
                                    source={{ uri: data.bestSeller.coverUrl }}
                                    style={styles.bookCover}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.coverPlaceholder}>
                                    <Text style={styles.coverPlaceholderText}>
                                        {data.bestSeller.title.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.bestSellerInfo}>
                            <View style={styles.bestSellerBadge}>
                                <Ionicons name="star" size={12} color="#F57C00" style={{ marginRight: 4 }} />
                                <Text style={styles.bestSellerBadgeText}>Top ventas</Text>
                            </View>

                            <Text style={styles.bestSellerTitle} numberOfLines={2}>
                                {data.bestSeller.title}
                            </Text>
                            <Text style={styles.bestSellerPrice}>
                                Precio: {formatPrice(data.bestSeller.price)}
                            </Text>

                            <View style={styles.bestSellerStatsRow}>
                                <Text style={styles.bestSellerSalesCount}>
                                    {data.bestSeller.salesCount} {data.bestSeller.salesCount === 1 ? 'venta' : 'ventas'}
                                </Text>
                                <Text style={styles.bestSellerRevenue}>
                                    Total: {formatPrice(data.bestSeller.totalRevenue)}
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                ) : data.hasPaidBooks ? (
                    <View style={styles.emptyStateBox}>
                        <Ionicons name="hourglass-outline" size={32} color="#9E9E9E" style={{ marginBottom: 8 }} />
                        <Text style={styles.emptyStateTitle}>Aún no tienes ventas registradas</Text>
                        <Text style={styles.emptyStateText}>
                            Tus libros pagos están publicados. En cuanto un lector compre uno de tus títulos, verás aquí el libro estrella y sus ventas acumuladas.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.emptyStateBox}>
                        <Ionicons name="book-outline" size={32} color="#9E9E9E" style={{ marginBottom: 8 }} />
                        <Text style={styles.emptyStateTitle}>Sin libros de pago publicados</Text>
                        <Text style={styles.emptyStateText}>
                            Para generar ganancias en BooFi, publica una historia con precio desde la sección de publicación.
                        </Text>
                    </View>
                )}
            </View>

            {/* 4. Estadísticas Rápidas */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
                        <Ionicons name="cart-outline" size={20} color="#2E7D32" />
                    </View>
                    <Text style={styles.statNumber}>{data.totalSalesCount}</Text>
                    <Text style={styles.statLabel}>Ventas totales</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="pricetag-outline" size={20} color="#1565C0" />
                    </View>
                    <Text style={styles.statNumber}>{data.paidBooksCount}</Text>
                    <Text style={styles.statLabel}>Libros de pago</Text>
                </View>
            </View>

            {/* 5. Historial reciente de ventas (si existe) */}
            {data.recentSales.length > 0 && (
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="time-outline" size={20} color={COLORS.primary || '#007AFF'} />
                        <Text style={styles.cardTitle}>Ventas recientes</Text>
                    </View>

                    {data.recentSales.map((sale) => (
                        <View key={sale.id} style={styles.saleItemRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.saleBookTitle} numberOfLines={1}>{sale.title}</Text>
                                <Text style={styles.saleDate}>
                                    {new Date(sale.purchasedAt).toLocaleDateString('es-AR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.saleAmount}>+ {formatPrice(sale.authorNet)}</Text>
                                <Text style={styles.saleGross}>Bruto: {formatPrice(sale.price)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || '#F8F9FA',
    },
    scrollContent: {
        paddingHorizontal: SPACING.m || 16,
        paddingTop: 16,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666666',
    },

    /* Tarjeta Principal de Saldo */
    balanceCard: {
        backgroundColor: COLORS.primary || '#007AFF',
        borderRadius: 22,
        padding: 20,
        marginBottom: 16,
        shadowColor: COLORS.primary || '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    balanceIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    balanceSubtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 0.5,
    },
    balanceTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    balanceAmount: {
        fontSize: 34,
        fontWeight: '800',
        color: '#FFFFFF',
        marginVertical: 4,
    },
    balanceDescription: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 16,
        lineHeight: 18,
    },
    checkoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 18,
        elevation: 1,
    },
    checkoutBtnText: {
        color: COLORS.primary || '#007AFF',
        fontSize: 15,
        fontWeight: '700',
    },

    /* Tarjetas Generales */
    card: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text || '#1A1A1A',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#666666',
        lineHeight: 17,
        marginBottom: 14,
    },

    /* Barra de proporción */
    ratioBarContainer: {
        flexDirection: 'row',
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    ratioBarShare: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratioBarText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },

    /* Filas de desglose */
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    breakdownRowHighlight: {
        borderBottomWidth: 0,
        backgroundColor: '#F8FDF8',
        paddingHorizontal: 8,
        borderRadius: 10,
        marginTop: 4,
    },
    breakdownLabel: {
        fontSize: 14,
        color: '#444444',
    },
    breakdownValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    /* Libro más vendido */
    bestSellerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#FFFDF9',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    coverWrapper: {
        width: 65,
        height: 95,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#EEEEEE',
    },
    bookCover: {
        width: '100%',
        height: '100%',
    },
    coverPlaceholder: {
        flex: 1,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverPlaceholderText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#777777',
    },
    bestSellerInfo: {
        flex: 1,
    },
    bestSellerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginBottom: 4,
    },
    bestSellerBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#E65100',
    },
    bestSellerTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    bestSellerPrice: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 6,
    },
    bestSellerStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bestSellerSalesCount: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2E7D32',
    },
    bestSellerRevenue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#555555',
    },

    /* Estados vacíos */
    emptyStateBox: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    emptyStateTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#444444',
        marginBottom: 4,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 12,
        color: '#777777',
        textAlign: 'center',
        lineHeight: 17,
    },

    /* Grid de Estadísticas */
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text || '#1A1A1A',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#777777',
        fontWeight: '500',
    },

    /* Ventas recientes */
    saleItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    saleBookTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    saleDate: {
        fontSize: 11,
        color: '#888888',
    },
    saleAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2E7D32',
    },
    saleGross: {
        fontSize: 10,
        color: '#999999',
    },

    btnPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }],
    },
});

export default ProfileEarnings;
