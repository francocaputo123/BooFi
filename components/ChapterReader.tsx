import { useCallback, useEffect, useRef, useState } from "react";
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ChapterListModal from "@/components/ChapterListModal";
import ChapterNavigationBar from "@/components/ChapterNavigationBar";
import EpubBlockView from "@/components/EpubBlockView";
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme";
import { clampChapterIndex, formatChapterCounter, getChapterNavigation } from "@/utils/chapterNavigation";
import { ChapterReaderProps, ReadingPosition } from "@/types/reading.types";

/**
 * Muestra un capitulo, permite pasar al anterior/siguiente y avisa el punto de lectura
 * para guardarlo. Retoma el capitulo y el scroll exactos de "initialProgress".
 */
const ChapterReader = ({ book, initialProgress, onSavePosition, onBack }: ChapterReaderProps) => {
    const totalChapters = book.chapters.length
    const initialIndex = clampChapterIndex(initialProgress?.chapterIndex ?? 0, totalChapters)
    const [chapterIndex, setChapterIndex] = useState(initialIndex)
    const [isListVisible, setIsListVisible] = useState(false)

    const scrollRef = useRef<ScrollView>(null)

    // Solo se restaura el scroll si el capitulo guardado sigue existiendo; si no, el offset no tiene sentido
    const pendingRestoreOffsetRef = useRef<number | null>(
        initialProgress && initialProgress.chapterIndex === initialIndex
            ? initialProgress.scrollOffset
            : null
    )
    const latestPositionRef = useRef<ReadingPosition>({
        chapterIndex: initialIndex,
        scrollOffset: pendingRestoreOffsetRef.current ?? 0,
    })

    // Se guarda una referencia para que el guardado al desmontar use siempre la última versión
    const onSavePositionRef = useRef(onSavePosition)
    onSavePositionRef.current = onSavePosition

    const persistPosition = useCallback(() => {
        onSavePositionRef.current(latestPositionRef.current)
    }, [])

    // Guardar al abrir hace que "Comenzar a leer" cuente como libro empezado;
    // guardar al salir cubre al usuario que vuelve atrás sin terminar de scrollear
    useEffect(() => {
        persistPosition()
        return () => persistPosition()
    }, [persistPosition])

    const trackPosition = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // En iOS el "rebote" del borde da offsets negativos, que no son un punto de lectura válido
        const scrollOffset = Math.max(0, event.nativeEvent.contentOffset.y)
        latestPositionRef.current = { chapterIndex, scrollOffset }
    }

    // Escribir en el dispositivo en cada frame de scroll sería excesivo: solo se guarda cuando el scroll frena
    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        trackPosition(event)
        persistPosition()
    }

    // El scroll no se puede aplicar hasta que el contenido tiene su altura final
    const handleContentSizeChange = (_width: number, contentHeight: number) => {
        const offset = pendingRestoreOffsetRef.current
        if (offset === null) return
        if (offset > 0 && contentHeight < offset) return

        scrollRef.current?.scrollTo({ y: offset, animated: false })
        pendingRestoreOffsetRef.current = null
    }

    // Si el usuario toma el control del scroll, no corresponde seguir "restaurando"
    const handleScrollBeginDrag = () => {
        pendingRestoreOffsetRef.current = null
    }

    const goToChapter = (targetIndex: number | null) => {
        if (targetIndex === null) return

        pendingRestoreOffsetRef.current = null
        latestPositionRef.current = { chapterIndex: targetIndex, scrollOffset: 0 }
        setChapterIndex(targetIndex)
        persistPosition()
    }

    // Elegir el capitulo que ya se esta leyendo solo cierra el listado: no tiene sentido volver al principio
    const handleSelectChapter = (targetIndex: number) => {
        setIsListVisible(false)
        if (targetIndex !== chapterIndex) goToChapter(targetIndex)
    }

    const navigation = getChapterNavigation(chapterIndex, totalChapters)
    const chapter = book.chapters[chapterIndex]

    // El capítulo ya trae su propio título como primer bloque, por eso el encabezado no lo repite

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={onBack} accessibilityLabel="Volver">
                    <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                </Pressable>
                <View style={styles.headerText}>
                    <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                    <Text style={styles.chapterCounter}>{formatChapterCounter(chapterIndex, totalChapters)}</Text>
                </View>
            </View>

            {/* "key" recrea el ScrollView en cada capítulo, así el nuevo arranca siempre arriba */}
            <ScrollView
                key={chapterIndex}
                ref={scrollRef}
                contentContainerStyle={styles.content}
                scrollEventThrottle={200}
                onScroll={trackPosition}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEnd}
                onMomentumScrollEnd={handleScrollEnd}
                onContentSizeChange={handleContentSizeChange}
            >
                {chapter.blocks.map((block, index) => (
                    <EpubBlockView key={index} block={block} />
                ))}
            </ScrollView>

            <ChapterNavigationBar
                navigation={navigation}
                onPrevious={() => goToChapter(navigation.previousIndex)}
                onNext={() => goToChapter(navigation.nextIndex)}
                onOpenList={() => setIsListVisible(true)}
            />

            <ChapterListModal
                visible={isListVisible}
                chapters={book.chapters}
                currentIndex={chapterIndex}
                onSelect={handleSelectChapter}
                onClose={() => setIsListVisible(false)}
            />
        </View>
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
    headerText: {
        flex: 1,
    },
    bookTitle: {
        color: COLORS.text,
        fontSize: FONTSIZE.m,
        fontWeight: "700",
    },
    chapterCounter: {
        color: COLORS.textSecondary,
        fontSize: FONTSIZE.xs,
    },
    content: {
        padding: SPACING.m,
    },
})

export default ChapterReader