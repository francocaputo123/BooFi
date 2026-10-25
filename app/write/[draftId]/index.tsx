import { useCallback, useState } from "react"
import { View, Text, Pressable, FlatList, ActivityIndicator, Alert, StyleSheet } from "react-native"
import { useLocalSearchParams, useFocusEffect, useRouter, Href } from "expo-router"
import authStore from "@/store/authStore"
import { Chapter } from "@/types/chapter.types"
import { createChapter, listChapters, deleteChapter, swapChapterOrder } from "@/services/chapterService"
import { useDraftBook } from "@/hooks/useDraftBook"
import ChapterCard from "@/components/ChapterCard"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

const ChapterListScreen = () => {
  const { draftId } = useLocalSearchParams() as { draftId: string }
  const uid = authStore((state) => state.public_id)
  const router = useRouter()
  const { previewDraft, publishDraft } = useDraftBook(draftId)

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const loadChapters = async () => {
    try {
      setErrorMessage(null)
      setChapters(await listChapters(uid, draftId))
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // NOTE: useFocusEffect y no useEffect, para recargar al volver del editor y ver los cambios
  useFocusEffect(
    useCallback(() => {
      loadChapters()
    }, [uid, draftId])
  )

  const handleAddChapter = async () => {
    if (isBusy) return
    setIsBusy(true)
    try {
      const lastChapter = chapters[chapters.length - 1]
      const nextOrder = lastChapter ? lastChapter.order + 1 : 1
      await createChapter(uid, draftId, `Capítulo ${nextOrder}`, nextOrder)
      await loadChapters()
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleMoveChapter = async (index: number, direction: -1 | 1) => {
    const neighbor = chapters[index + direction]
    if (!neighbor || isBusy) return
    setIsBusy(true)
    try {
      await swapChapterOrder(uid, draftId, chapters[index], neighbor)
      await loadChapters()
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleDeleteChapter = (chapter: Chapter) => {
    Alert.alert("Borrar capítulo", `¿Borrar "${chapter.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteChapter(uid, draftId, chapter.id)
            await loadChapters()
          } catch (error) {
            setErrorMessage((error as Error).message)
          }
        },
      },
    ])
  }

  const handlePreview = async () => {
    try {
      await previewDraft()
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  const handlePublish = async () => {
    try {
      await publishDraft()
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  if (isLoading) {
    return <ActivityIndicator style={styles.center} color={COLORS.primary} />
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Pressable
          style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
          onPress={handleAddChapter}
          disabled={isBusy}
        >
          <Text style={styles.primaryButtonText}>Agregar capítulo</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push(`/write/${draftId}/settings` as Href)}
        >
          <Text style={styles.secondaryButtonText}>Configuración de la historia</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handlePreview}>
          <Text style={styles.secondaryButtonText}>Leer historia</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={handlePublish}>
          <Text style={styles.primaryButtonText}>Publicar historia</Text>
        </Pressable>
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {chapters.length === 0 ? (
        <Text style={styles.emptyText}>Todavía no tenés capítulos.</Text>
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(chapter) => chapter.id}
          renderItem={({ item, index }) => (
            <ChapterCard
              chapter={item}
              isFirst={index === 0}
              isLast={index === chapters.length - 1}
              onPress={() => router.push(`/write/${draftId}/${item.id}` as Href)}
              onMoveUp={() => handleMoveChapter(index, -1)}
              onMoveDown={() => handleMoveChapter(index, 1)}
              onDelete={() => handleDeleteChapter(item)}
            />
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.m },
  buttons: { gap: SPACING.s },
  primaryButton: { backgroundColor: COLORS.primary, padding: SPACING.m, borderRadius: 8, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontSize: FONTSIZE.m },
  secondaryButton: {
    borderColor: COLORS.primary, borderWidth: 1, padding: SPACING.m,
    borderRadius: 8, alignItems: "center",
  },
  secondaryButtonText: { color: COLORS.primary, fontSize: FONTSIZE.m },
  buttonDisabled: { opacity: 0.5 },
  errorText: { color: COLORS.dangerText, marginTop: SPACING.s },
  emptyText: { color: COLORS.textSecondary, marginTop: SPACING.l, textAlign: "center" },
})

export default ChapterListScreen