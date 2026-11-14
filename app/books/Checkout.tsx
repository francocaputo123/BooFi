import { useEffect, useState, useRef } from "react"
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as Linking from "expo-linking"
import { COLORS, FONTSIZE, SPACING } from "@/constants/theme"
import { COVER_MOCK } from "@/data/epubMock"
import { usePublishedBook } from "@/hooks/usePublishedBook"
import { useBookAccess } from "@/hooks/useBookAccess"
import { bookRouteParamsSchema } from "@/schema/reading.schema"
import { recordBookPurchase } from "@/services/purchaseService"
import { openMercadoPagoCheckout } from "@/services/paymentService"
import authStore from "@/store/authStore"
import bookStore from "@/store/bookStore"
import { formatPrice } from "@/utils/formatPrice"
import StatusMessage from "@/components/ui/StatusMessage"

const Checkout = () => {
    const router = useRouter()
    const params = useLocalSearchParams()
    const incomingUrl = Linking.useURL()

    const parsedParams = bookRouteParamsSchema.safeParse(params)
    const bookId = parsedParams.success ? parsedParams.data.id : ""

    const currentUserId = authStore((state) => state.public_id)
    const book = bookStore((state) => state.booksById[bookId])
    const { isLoadingBook, loadErrorMessage } = usePublishedBook(bookId)
    const { isPurchased } = useBookAccess(bookId, book)

    const [isProcessing, setIsProcessing] = useState(false)
    const [purchaseSuccess, setPurchaseSuccess] = useState(false)
    const isConfirmingRef = useRef(false)
    const hasHandledSuccessRef = useRef(false)

    const price = book?.price ?? 0
    const formattedPrice = formatPrice(price)

    const handleConfirmPurchase = async (customPaymentId?: string) => {
        if (!currentUserId || !book) {
            Alert.alert("Sesión requerida", "Tenés que iniciar sesión para comprar un libro.")
            return
        }

        if (isConfirmingRef.current || hasHandledSuccessRef.current) {
            return
        }
        isConfirmingRef.current = true

        try {
            setIsProcessing(true)
            await recordBookPurchase(currentUserId, {
                bookId,
                title: book.title,
                price,
                currency: "ARS",
                paymentId: customPaymentId,
            })

            hasHandledSuccessRef.current = true
            setPurchaseSuccess(true)
            Alert.alert(
                "¡Compra exitosa!",
                `Ya tenés acceso a "${book.title}". ¡Disfrutá de tu lectura!`,
                [
                    {
                        text: "Ir a leer",
                        onPress: () => {
                            router.replace({ pathname: "/books/Details", params: { id: bookId } })
                        },
                    },
                ]
            )
        } catch (error) {
            isConfirmingRef.current = false
            Alert.alert("Error", error instanceof Error ? error.message : "No se pudo procesar la compra")
        } finally {
            setIsProcessing(false)
        }
    }

    useEffect(() => {
        const queryParams = params as Record<string, string | undefined>
        const parsedIncoming = incomingUrl ? Linking.parse(incomingUrl).queryParams : null

        const status =
            queryParams.collection_status ||
            queryParams.status ||
            (parsedIncoming?.collection_status as string | undefined) ||
            (parsedIncoming?.status as string | undefined)

        const targetBookId =
            queryParams.id ||
            (parsedIncoming?.id as string | undefined)

        if (targetBookId && targetBookId !== bookId) return

        if (status === "approved" && currentUserId && !isPurchased && !purchaseSuccess && !isConfirmingRef.current && !hasHandledSuccessRef.current) {
            const paymentId = (queryParams.payment_id || parsedIncoming?.payment_id) as string | undefined
            handleConfirmPurchase(paymentId)
            return
        }

        if (status === "rejected") {
            Alert.alert(
                "Pago rechazado",
                "Mercado Pago no pudo procesar el pago. No se realizó ningún cargo. Podés volver a intentar con otro medio de pago."
            )
            return
        }

        if (status === "in_process" || status === "pending") {
            Alert.alert(
                "Pago pendiente",
                "El pago está en proceso de acreditación. Apenas se confirme, el libro se desbloqueará en tu cuenta."
            )
        }
    }, [params, incomingUrl, currentUserId, isPurchased, purchaseSuccess, bookId])

    const handleMercadoPagoPress = async () => {
        if (!currentUserId || !book) {
            Alert.alert("Sesión requerida", "Tenés que iniciar sesión para comprar un libro.")
            return
        }

        try {
            setIsProcessing(true)
            await openMercadoPagoCheckout({
                bookId,
                title: book.title,
                price,
            })
        } catch (error) {
            Alert.alert(
                "Mercado Pago",
                error instanceof Error ? error.message : "No se pudo iniciar el checkout de Mercado Pago"
            )
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoadingBook || !book) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusMessage
                    isLoading={isLoadingBook}
                    message={isLoadingBook ? "Cargando libro..." : (loadErrorMessage || "Libro no encontrado")}
                    actionLabel="Volver"
                    onAction={() => router.back()}
                />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Finalizar compra</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.bookSummaryRow}>
                        <Image
                            source={{ uri: book.coverUri ?? COVER_MOCK }}
                            style={styles.bookCover}
                            resizeMode="contain"
                        />
                        <View style={styles.bookInfo}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Libro completo</Text>
                            </View>
                            <Text style={styles.bookTitle} numberOfLines={2}>
                                {book.title}
                            </Text>
                            <Text style={styles.bookAuthor} numberOfLines={1}>
                                Por {book.author}
                            </Text>
                            <Text style={styles.bookPriceTag}>{formattedPrice}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionHeading}>Resumen del pedido</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Subtotal</Text>
                        <Text style={styles.priceValue}>{formattedPrice}</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Moneda</Text>
                        <Text style={styles.priceValue}>Pesos Argentinos (ARS)</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.priceRow}>
                        <Text style={styles.totalLabel}>Total a pagar</Text>
                        <Text style={styles.totalValue}>{formattedPrice}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.mpHeader}>
                        <Ionicons name="card-outline" size={22} color={COLORS.primary} />
                        <Text style={styles.sectionHeading}>Medio de pago</Text>
                    </View>
                    <Text style={styles.mpDescription}>
                        Procesado de forma segura por <Text style={{ fontWeight: "700" }}>Mercado Pago</Text>. Podrás pagar con tarjeta de débito, crédito o dinero en cuenta.
                    </Text>
                </View>

                {isPurchased || purchaseSuccess ? (
                    <View style={styles.alreadyPurchasedCard}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.successText} />
                        <Text style={styles.alreadyPurchasedText}>¡Ya compraste este libro!</Text>
                        <Pressable
                            style={styles.goToDetailsButton}
                            onPress={() => router.replace({ pathname: "/books/Details", params: { id: bookId } })}
                        >
                            <Text style={styles.goToDetailsButtonText}>Ir a la ficha y leer</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        style={[styles.payButton, isProcessing && styles.buttonDisabled]}
                        onPress={handleMercadoPagoPress}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color={COLORS.background} />
                        ) : (
                            <>
                                <Ionicons name="wallet-outline" size={20} color={COLORS.background} />
                                <Text style={styles.payButtonText}>
                                    Pagar con Mercado Pago · {formattedPrice}
                                </Text>
                            </>
                        )}
                    </Pressable>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.xs,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: FONTSIZE.m,
        fontWeight: "700",
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING.m,
        gap: SPACING.m,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bookSummaryRow: {
        flexDirection: "row",
        gap: SPACING.m,
    },
    bookCover: {
        width: 80,
        height: 120,
        borderRadius: 6,
        backgroundColor: COLORS.border,
    },
    bookInfo: {
        flex: 1,
        justifyContent: "center",
        gap: SPACING.xs,
    },
    badge: {
        backgroundColor: COLORS.primary,
        borderRadius: 6,
        paddingHorizontal: SPACING.xs + 2,
        paddingVertical: 2,
        alignSelf: "flex-start",
    },
    badgeText: {
        color: COLORS.background,
        fontSize: FONTSIZE.xs - 2,
        fontWeight: "700",
    },
    bookTitle: {
        fontSize: FONTSIZE.m,
        fontWeight: "700",
        color: COLORS.text,
    },
    bookAuthor: {
        fontSize: FONTSIZE.s,
        color: COLORS.accent,
    },
    bookPriceTag: {
        fontSize: FONTSIZE.l,
        fontWeight: "800",
        color: COLORS.primary,
        marginTop: SPACING.xs,
    },
    sectionHeading: {
        fontSize: FONTSIZE.m,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: SPACING.xs,
    },
    priceLabel: {
        fontSize: FONTSIZE.s,
        color: COLORS.textSecondary,
    },
    priceValue: {
        fontSize: FONTSIZE.s,
        color: COLORS.text,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.s,
    },
    totalLabel: {
        fontSize: FONTSIZE.m,
        fontWeight: "700",
        color: COLORS.text,
    },
    totalValue: {
        fontSize: FONTSIZE.l,
        fontWeight: "800",
        color: COLORS.primary,
    },
    mpHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.s,
    },
    mpDescription: {
        fontSize: FONTSIZE.s,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    payButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SPACING.m,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.s,
        marginTop: SPACING.xs,
    },
    payButtonText: {
        color: COLORS.background,
        fontSize: FONTSIZE.m,
        fontWeight: "700",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    alreadyPurchasedCard: {
        backgroundColor: COLORS.success,
        borderRadius: 12,
        padding: SPACING.l,
        alignItems: "center",
        gap: SPACING.s,
    },
    alreadyPurchasedText: {
        color: COLORS.successText,
        fontSize: FONTSIZE.m,
        fontWeight: "700",
    },
    goToDetailsButton: {
        backgroundColor: COLORS.successText,
        borderRadius: 8,
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.m,
        marginTop: SPACING.xs,
    },
    goToDetailsButtonText: {
        color: COLORS.background,
        fontSize: FONTSIZE.s,
        fontWeight: "600",
    },
})

export default Checkout
