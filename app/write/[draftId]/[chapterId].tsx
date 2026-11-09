import { useEffect, useState } from "react"
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native"
import { Stack, useLocalSearchParams, useRouter, Href } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useChapterEditor } from "@/hooks/useChapterEditor"
import { useChapterList } from "@/hooks/useChapterList"
import { useDraftBook } from "@/hooks/useDraftBook"
import ChapterPicker from "@/components/ChapterPicker"
import { SAVE_STATUS_LABELS } from "@/constants/chapterEditor"
import { Chapter } from "@/types/chapter.types"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

const ChapterEditorScreen = () => {
  const { draftId, chapterId } = useLocalSearchParams() as { draftId: string; chapterId: string }
  const router = useRouter()
  const { title, setTitle, content, setContent, isLoading, errorMessage, saveStatus, saveNow } =
    useChapterEditor(draftId, chapterId)
  const {
    chapters, isBusy, errorMessage: listError, loadChapters, addChapter, moveChapter, removeChapter,
  } = useChapterList(draftId)
  const { previewDraft, publishDraft } = useDraftBook(draftId)
  const [justSaved, setJustSaved] = useState(false)
  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    loadChapters()
  }, [loadChapters])

  useEffect(() => {
  if (!justSaved) return
  const timer = setTimeout(() => setJustSaved(false), 1500)
  return () => clearTimeout(timer)
  }, [justSaved])

  // Se numera por posición y no por "order", porque borrar un capítulo deja huecos en "order"
  const chapterPosition = chapters.findIndex((chapter) => chapter.id === chapterId) + 1
  const chapterLabel = chapterPosition > 0 ? `Capítulo ${chapterPosition}` : "Capítulo"

  // replace y no push: cambiar de capítulo no debe apilar pantallas en el historial
  const openChapter = (nextChapterId: string) => {
    router.replace(`/write/${draftId}/${nextChapterId}` as Href)
  }

  const handleOpenPicker = async () => {
    setActionError(null)
    // Se guarda antes para que la lista muestre el título recién escrito
    await saveNow()
    await loadChapters()
    setIsPickerVisible(true)
  }

  const handleSelectChapter = (chapter: Chapter) => {
    setIsPickerVisible(false)
    if (chapter.id !== chapterId) {
      openChapter(chapter.id)
    }
  }

  const handleAddChapter = async () => {
    await saveNow()
    const newChapterId = await addChapter()
    if (newChapterId) {
      setIsPickerVisible(false)
      openChapter(newChapterId)
    }
  }

  const handleSave = async () => {
  const wasSaved = await saveNow()
  // Si falló, el pie de pantalla ya muestra "No se pudo guardar" en rojo
  if (wasSaved) {
    setJustSaved(true)
    }
  }

  const handleDeleteChapter = (chapter: Chapter) => {
  if (chapters.length <= 1) {
    Alert.alert(
      "No se puede borrar",
      "Una historia necesita al menos un capítulo. Para eliminarla por completo, hacelo desde la lista de historias."
    )
    return
  }
    Alert.alert("Borrar capítulo", `¿Borrar "${chapter.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          const wasDeleted = await removeChapter(chapter)
          // Si se borró el que se está editando, se vuelve a la entrada, que abre otro o crea uno nuevo
          if (wasDeleted && chapter.id === chapterId) {
            setIsPickerVisible(false)
            router.replace(`/write/${draftId}` as Href)
          }
        },
      },
    ])
  }

  const handleSettings = () => {
    setIsPickerVisible(false)
    router.push(`/write/${draftId}/settings` as Href)
  }

  // El panel se cierra antes de navegar: un Modal abierto queda tapando la pantalla siguiente
  const handlePreview = async () => {
    setIsPickerVisible(false)
    try {
      setActionError(null)
      await saveNow()
      await previewDraft()
    } catch (error) {
      setActionError((error as Error).message)
    }
  }

  const handlePublish = async () => {
    setIsPickerVisible(false)
    try {
      setActionError(null)
      await saveNow()
      await publishDraft()
    } catch (error) {
      setActionError((error as Error).message)
    }
  }

  if (isLoading) {
    return <ActivityIndicator style={styles.center} color={COLORS.primary} />
  }

  if (errorMessage) {
    return <Text style={styles.errorText}>{errorMessage}</Text>
  }

  const bannerError = actionError ?? listError

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable style={styles.chapterSelector} onPress={handleOpenPicker}>
              <Text style={styles.chapterSelectorText}>{chapterLabel}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.text} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={handleAddChapter} disabled={isBusy}>
                <Text style={styles.headerAction}>+ Nuevo</Text>
              </Pressable>
              <Pressable onPress={handleSave}>
                <Text style={styles.headerAction}>{justSaved ? "Guardado ✓" : "Guardar"}</Text>
              </Pressable>
            </View>
          ),
        }}
      />

      {bannerError && <Text style={styles.errorText}>{bannerError}</Text>}

      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Título del capítulo"
        placeholderTextColor={COLORS.textSecondary}
      />
      <TextInput
        style={styles.contentInput}
        value={content}
        onChangeText={setContent}
        placeholder="Empezá a escribir..."
        placeholderTextColor={COLORS.textSecondary}
        multiline
        textAlignVertical="top"
      />

      <View style={styles.footer}>
        <Text style={saveStatus === "error" ? styles.statusError : styles.status}>
          {SAVE_STATUS_LABELS[saveStatus]}
        </Text>
      </View>

      <ChapterPicker
        visible={isPickerVisible}
        chapters={chapters}
        currentChapterId={chapterId}
        onClose={() => setIsPickerVisible(false)}
        onSelect={handleSelectChapter}
        onMove={moveChapter}
        onDelete={handleDeleteChapter}
        onSettings={handleSettings}
        onPreview={handlePreview}
        onPublish={handlePublish}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.m },
  chapterSelector: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  chapterSelectorText: { fontSize: FONTSIZE.m, fontWeight: "bold", color: COLORS.text },
  headerActions: { flexDirection: "row", gap: SPACING.m },
  headerAction: { fontSize: FONTSIZE.s, color: COLORS.primary },
  titleInput: {
    fontSize: FONTSIZE.xl, fontWeight: "bold", color: COLORS.text,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.s,
  },
  contentInput: { flex: 1, fontSize: FONTSIZE.m, color: COLORS.text, marginTop: SPACING.m },
  footer: { flexDirection: "row", justifyContent: "space-between", paddingTop: SPACING.s },
  status: { color: COLORS.textSecondary, fontSize: FONTSIZE.xs },
  statusError: { color: COLORS.dangerText, fontSize: FONTSIZE.xs },
  errorText: { color: COLORS.dangerText, padding: SPACING.s },
})

export default ChapterEditorScreen