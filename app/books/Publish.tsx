import { useState } from "react"
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import StatusMessage from "@/components/ui/StatusMessage"
import TagSelector from "@/components/ui/TagSelector"
import SynopsisEditModal from "@/components/ui/SynopsisEditModal"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import { AVAILABLE_TAGS, PUBLISH_LABELS } from "@/data/publishData"
import { publishFormSchema } from "@/schema/publish.schema"
import { bookRouteParamsSchema } from "@/schema/reading.schema"
import bookStore from "@/store/bookStore"
import authStore from "@/store/authStore"
import { publishBook } from "@/services/bookService"
import { prepareCover } from "@/utils/prepareCover"
import { useAuthorName } from "@/hooks/useAuthorName"
import { estimateReadingMinutesPerChapter, formatReadingTime } from "@/utils/readingTime"
import { ChapterAccess } from "@/types/chapter.types"
import { EpubParsedBook } from "@/types/epub.types"
import { DEFAULT_CHAPTER_ACCESS } from "@/constants/chapterAccess"
// TEST TEST
const ALLOW_PUBLISH_WITHOUT_AUTHOR = __DEV__
const TEST_AUTHOR_NAME = "Autor de prueba"
// TEST TEST


type PublishStatus = "idle" | "publishing" | "success" | "error" 


/* Opciones de tipo de acceso (RF7.1). Lo elegido se aplica a todos los capitulos del libro */
const ACCESS_OPTIONS = [
    {
        key: "free" as const,
        title: PUBLISH_LABELS.ACCESS_FREE,
        description: PUBLISH_LABELS.ACCESS_FREE_DESC,
        icon: "book-outline" as const,
    },
    {
        key: "premium" as const,
        title: PUBLISH_LABELS.ACCESS_PREMIUM,
        description: PUBLISH_LABELS.ACCESS_PREMIUM_DESC,
        // Ionicons no tiene "crown-outline"; diamond-outline da la idea de premium/exclusivo
        icon: "diamond-outline" as const,
    },
    {
        key: "paid" as const,
        title: PUBLISH_LABELS.ACCESS_PAID,
        description: PUBLISH_LABELS.ACCESS_PAID_DESC,
        icon: "cash-outline" as const,
    },
]

/**
 * Pantalla de publicacion de un libro. Muestra la ficha tecnica que ya trae el epub
 * (titulo, autor y cantidad de capitulos) y permite editar la sinopsis y las categorias.
 * Publica según las opciones de acceso seleccionadas.
 */
const PublishScreen = () => {
    const router = useRouter()
    const params = useLocalSearchParams()

    const parsedParams = bookRouteParamsSchema.safeParse(params)
    const bookId = parsedParams.success ? parsedParams.data.id : ""

    const book = bookStore((state) => state.booksById[bookId])
    const authorId = authStore((state) => state.public_id)
    // El autor que firma es el usuario logueado (ver profiles/{userId}.username)
    const authorName = useAuthorName()
    const saveBook = bookStore((state) => state.saveBook)
    // TEST TEST
    const effectiveAuthorName =
    authorName || (ALLOW_PUBLISH_WITHOUT_AUTHOR ? TEST_AUTHOR_NAME : "")
    // TEST TEST



    // La sinopsis del epub se precarga como valor inicial; el autor puede reescribirla o dejarla
    const [synopsis, setSynopsis] = useState(book?.synopsis ?? "")
    const [tags, setTags] = useState<string[]>(book?.tags ?? [])
    const [isSynopsisModalVisible, setIsSynopsisModalVisible] = useState(false)
    const [status, setStatus] = useState<PublishStatus>("idle")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [access, setAccess] = useState<ChapterAccess>(DEFAULT_CHAPTER_ACCESS)

    const toggleTag = (tag: string) => {
        setTags((current) =>
            current.includes(tag)
                ? current.filter((item) => item !== tag)
                : [...current, tag]
        )
    }

    const handlePublish = async () => {
        setErrorMessage("")

        const validation = publishFormSchema.safeParse({ tags, synopsis })
        if (!validation.success) {
            setStatus("error")
            setErrorMessage(validation.error.issues[0]?.message ?? "Datos inválidos")
            return
        }

        if (!book || !authorId || !effectiveAuthorName) {
            setStatus("error")
            setErrorMessage("Faltan datos para publicar. Volvé a cargar el libro.")
            return
        }
        // El acceso elegido se aplica a todos los capitulos del libro
        const bookWithAccess: EpubParsedBook = {
            ...book,
            chapters: book.chapters.map((chapter) => ({ ...chapter, access })),
        }

        try {
            setStatus("publishing")
            const coverJpegBase64 = await prepareCover(book.coverUri)
            const result = await publishBook({
                authorId,
                // TEST TEST
                authorName: effectiveAuthorName,
                book: bookWithAccess,
                synopsis: validation.data.synopsis,
                tags: validation.data.tags,
                coverJpegBase64,
                visibility: "public",
            })

            if (result.status === "duplicate") {
                setStatus("error")
                setErrorMessage(PUBLISH_LABELS.DUPLICATE_TITLE)
                return
            }
            
            // Se actualiza el store para que la ficha (Details) muestre el acceso sin recargar nada
            saveBook(bookWithAccess)
            setStatus("success")
        } catch (error) {
            setStatus("error")
            setErrorMessage(error instanceof Error ? error.message : "No se pudo publicar el libro")
        }
    }

    // Mismo criterio que Details: sin libro en el store, no hay nada que publicar
    if (!book) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{PUBLISH_LABELS.SCREEN_TITLE}</Text>
                </View>
                <StatusMessage
                    message={PUBLISH_LABELS.BOOK_NOT_FOUND}
                    actionLabel={PUBLISH_LABELS.BACK}
                    onAction={() => router.back()}
                />
            </SafeAreaView>
        )
    }

    if (status === "success") {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusMessage
                    message={`${PUBLISH_LABELS.SUCCESS_TITLE} ${PUBLISH_LABELS.SUCCESS_MESSAGE}`}
                    actionLabel={PUBLISH_LABELS.BACK}
                    onAction={() => router.back()}
                />
            </SafeAreaView>
        )
    }

    const isPublishing = status === "publishing"
    const readingTime = estimateReadingMinutesPerChapter(book)

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                </Pressable>
                <Text style={styles.headerTitle}>{PUBLISH_LABELS.SCREEN_TITLE}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionTitle}>{PUBLISH_LABELS.SECTION_TECHNICAL_SHEET}</Text>

                {/* Ficha tecnica: titulo, autor y sinopsis (editable) van en un mismo bloque */}
                <View style={styles.card}>
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>{PUBLISH_LABELS.FIELD_TITLE}</Text>
                        <Text style={styles.fieldValue} numberOfLines={2}>{book.title}</Text>
                    </View>

                    <View style={styles.separator} />

                    {/*
                     * TODO: cuando haya flujo de edicion de perfil, hacer este campo navegable.
                     * Hoy se muestra con chevron para seguir el mockup, pero no es tocable.
                     */}
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>{PUBLISH_LABELS.FIELD_AUTHOR}</Text>
                        <View style={styles.fieldRow}>
                            <Text style={[styles.fieldValue, styles.fieldValueAccent]} numberOfLines={1}>
                                {authorName || "—"}
                            </Text>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>{PUBLISH_LABELS.FIELD_SYNOPSIS}</Text>
                        <Text
                            style={[styles.fieldValue, !synopsis && styles.fieldPlaceholder]}
                            numberOfLines={4}
                        >
                            {synopsis || PUBLISH_LABELS.SYNOPSIS_EMPTY}
                        </Text>
                        <Pressable
                            onPress={() => setIsSynopsisModalVisible(true)}
                            style={styles.editButton}
                            disabled={isPublishing}
                            accessibilityRole="button"
                        >
                            <Text style={styles.editButtonText}>{PUBLISH_LABELS.EDIT}</Text>
                        </Pressable>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>{PUBLISH_LABELS.FIELD_TAGS}</Text>
                        <TagSelector
                            options={AVAILABLE_TAGS}
                            selected={tags}
                            onToggle={toggleTag}
                        />
                    </View>
                </View>

                {/* Estadisticas del libro: cantidad de capitulos y estimacion de lectura */}
                <View style={[styles.card, styles.statsCard]}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{book.chapters.length}</Text>
                        <Text style={styles.statLabel}>{PUBLISH_LABELS.STATS_CHAPTERS}</Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{formatReadingTime(readingTime)}</Text>
                        <Text style={styles.statLabel}>{PUBLISH_LABELS.STATS_READING_TIME}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{PUBLISH_LABELS.SECTION_ACCESS_TYPE}</Text>

                {/* El autor elige uno de los tres tipos */}
                {ACCESS_OPTIONS.map((option) => {
                    const isSelected = option.key === access
                    return (
                        <Pressable
                            key={option.key}
                            style={[styles.accessOption, isSelected && styles.accessOptionSelected]}
                            onPress={() => setAccess(option.key)}
                            disabled={isPublishing}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: isSelected, disabled: isPublishing }}
                        >
                            <View style={styles.accessIcon}>
                                <Ionicons name={option.icon} size={20} color={COLORS.textSecondary} />
                            </View>
                            <View style={styles.accessText}>
                                <Text style={styles.accessTitle}>{option.title}</Text>
                                <Text style={styles.accessDescription}>{option.description}</Text>
                            </View>
                            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                {isSelected && <View style={styles.radioDot} />}
                            </View>
                        </Pressable>
                    )
                })}

                <View style={styles.sectionWithBadge}>
                    <Text style={styles.sectionTitle}>{PUBLISH_LABELS.SECTION_SCHEDULE}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{PUBLISH_LABELS.IN_DEVELOPMENT}</Text>
                    </View>
                </View>
                <View style={styles.toggleRow}>
                    <Text style={styles.toggleHint}>{PUBLISH_LABELS.SCHEDULE_HINT}</Text>
                    <Switch value={false} disabled />
                </View>

                <View style={styles.sectionWithBadge}>
                    <Text style={styles.sectionTitle}>{PUBLISH_LABELS.SECTION_NOTIFY}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{PUBLISH_LABELS.IN_DEVELOPMENT}</Text>
                    </View>
                </View>
                <View style={styles.toggleRow}>
                    <Text style={styles.toggleHint}>{PUBLISH_LABELS.NOTIFY_HINT}</Text>
                    <Switch value={false} disabled />
                </View>

                {status === "error" && errorMessage.length > 0 && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                )}

                <Pressable
                    style={[styles.publishButton, isPublishing && styles.publishButtonDisabled]}
                    onPress={handlePublish}
                    disabled={isPublishing}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isPublishing }}
                >
                    {isPublishing ? (
                        <View style={styles.publishingRow}>
                            <ActivityIndicator color={COLORS.background} />
                            <Text style={styles.publishButtonText}>{PUBLISH_LABELS.PUBLISHING}</Text>
                        </View>
                    ) : (
                        <View style={styles.publishingRow}>
                            <Ionicons name="flash" size={18} color={COLORS.background} />
                            <Text style={styles.publishButtonText}>{PUBLISH_LABELS.PUBLISH_NOW}</Text>
                        </View>
                    )}
                </Pressable>
            </ScrollView>

            <SynopsisEditModal
                visible={isSynopsisModalVisible}
                initialValue={synopsis}
                onSave={setSynopsis}
                onClose={() => setIsSynopsisModalVisible(false)}
            />
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
        gap: SPACING.m,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING.s,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: FONTSIZE.l,
        fontWeight: "700",
    },
    content: {
        padding: SPACING.m,
        paddingBottom: SPACING.xxl,
    },
    sectionTitle: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.xs,
        fontWeight: "700",
        letterSpacing: 0.8,
        marginTop: SPACING.l,
        marginBottom: SPACING.s,
    },
    sectionWithBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.s,
        marginTop: SPACING.l,
        marginBottom: SPACING.s,
    },
    badge: {
        backgroundColor: COLORS.danger,
        borderRadius: 10,
        paddingHorizontal: SPACING.s,
        paddingVertical: 2,
    },
    badgeText: {
        color: COLORS.dangerText,
        fontSize: FONTSIZE.xs,
        fontWeight: "700",
    },
    card: {
        backgroundColor: COLORS.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    field: {
        padding: SPACING.m,
    },
    fieldLabel: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.xs,
        fontWeight: "600",
        marginBottom: SPACING.xs,
    },
    fieldValue: {
        color: COLORS.text,
        fontSize: FONTSIZE.m,
    },
    fieldValueAccent: {
        color: COLORS.text,
        flex: 1,
    },
    fieldPlaceholder: {
        color: COLORS.textSecondary,
        fontStyle: "italic",
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.s,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
    },
    editButton: {
        alignSelf: "flex-end",
        marginTop: SPACING.s,
    },
    editButtonText: {
        color: COLORS.primary,
        fontSize: FONTSIZE.s,
        fontWeight: "700",
    },
    statsCard: {
        flexDirection: "row",
        marginTop: SPACING.m,
    },
    stat: {
        flex: 1,
        alignItems: "center",
        paddingVertical: SPACING.m,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
    },
    statValue: {
        color: COLORS.text,
        fontSize: FONTSIZE.l,
        fontWeight: "700",
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.xs,
        marginTop: SPACING.xs,
    },
    accessOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.m,
        backgroundColor: COLORS.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.m,
        marginBottom: SPACING.s,
    },
    accessOptionSelected: {
        borderColor: COLORS.primary,
    },
    accessIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    accessText: {
        flex: 1,
    },
    accessTitle: {
        color: COLORS.text,
        fontSize: FONTSIZE.m,
        fontWeight: "700",
    },
    accessDescription: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.s,
        marginTop: 2,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    radioSelected: {
        borderColor: COLORS.primary,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: SPACING.m,
    },
    toggleHint: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.s,
        flex: 1,
    },
    errorText: {
        color: COLORS.dangerText,
        backgroundColor: COLORS.danger,
        borderRadius: 8,
        padding: SPACING.s,
        marginTop: SPACING.m,
        fontSize: FONTSIZE.s,
    },
    publishButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: SPACING.m,
        alignItems: "center",
        marginTop: SPACING.l,
    },
    publishButtonDisabled: {
        opacity: 0.6,
    },
    publishButtonText: {
        color: COLORS.background,
        fontSize: FONTSIZE.m,
        fontWeight: "700",
    },
    publishingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.s,
    },
})

export default PublishScreen