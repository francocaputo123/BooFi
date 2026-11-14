import { useEffect, useState } from "react"
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useChapterEditor } from "@/hooks/useChapterEditor"
import { useChapterList } from "@/hooks/useChapterList"
import { useDraftBook } from "@/hooks/useDraftBook"
import ChapterPicker from "@/components/ChapterPicker"
import HeaderAddButton from "@/components/HeaderAddButton"
import PopupMenu, { PopupMenuItem } from "@/components/PopupMenu"
import RichTextEditor from "@/components/RichTextEditor"
import { SAVE_STATUS_LABELS } from "@/constants/chapterEditor"
import { Chapter } from "@/types/chapter.types"
import { getChapterTitle } from "@/utils/getChapterTitle"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

const CHAPTER_SELECTOR_MAX_WIDTH = 180

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
  const [isMenuVisible, setIsMenuVisible] = useState(false)
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
  const getPosition = (id: string) => chapters.findIndex((chapter) => chapter.id === id) + 1
  const chapterLabel = getChapterTitle({ title }, getPosition(chapterId))

  // replace y no push: cambiar de capítulo no debe apilar pantallas en el historial
  const openChapter = (nextChapterId: string) => {
    router.replace({
      pathname: "/write/[draftId]/[chapterId]",
      params: { draftId, chapterId: nextChapterId },
    })
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
    Alert.alert("Borrar capítulo", `¿Borrar "${getChapterTitle(chapter, getPosition(chapter.id))}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          const wasDeleted = await removeChapter(chapter)
          // Si se borró el que se está editando, se vuelve a la entrada, que abre otro o crea uno nuevo
          if (wasDeleted && chapter.id === chapterId) {
            setIsPickerVisible(false)
            router.replace({ pathname: "/write/[draftId]", params: { draftId } })
          }
        },
      },
    ])
  }

  const handleSettings = () => {
    router.push({ pathname: "/write/[draftId]/settings", params: { draftId } })
  }

  /**
   * Guarda lo pendiente y corre la acción; si falla, muestra el error arriba.
   * NOTE: PopupMenu cierra el menú antes de llamar a estas funciones (un Modal abierto tapa la pantalla siguiente)
   * @param () => Promise<void> action : vista previa o publicación
   */
  const runAfterSaving = async (action: () => Promise<void>) => {
    try {
      setActionError(null)
      await saveNow()
      await action()
    } catch (error) {
      setActionError((error as Error).message)
    }
  }

  const menuItems: PopupMenuItem[] = [
    { label: "Vista previa", icon: "book-outline", onPress: () => runAfterSaving(previewDraft) },
    { label: "Configuración", icon: "settings-outline", onPress: handleSettings },
    {
      label: "Publicar historia", icon: "cloud-upload-outline", hasSeparator: true,
      onPress: () => runAfterSaving(publishDraft),
    },
  ]

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
              <Text style={styles.chapterSelectorText} numberOfLines={1}>{chapterLabel}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.text} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <HeaderAddButton onPress={handleAddChapter} disabled={isBusy} />
              <Pressable onPress={handleSave} hitSlop={8}>
                <Text style={styles.headerAction}>{justSaved ? "Guardado ✓" : "Guardar"}</Text>
              </Pressable>
              <Pressable onPress={() => setIsMenuVisible(true)} hitSlop={8}>
                <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
              </Pressable>
            </View>
          ),
        }}
      />

      {bannerError && <Text style={styles.errorText}>{bannerError}</Text>}

      <View style={styles.editor}>
        {/* key: cada capítulo arma su propio editor, el contenido inicial se lee una sola vez */}
        <RichTextEditor key={chapterId} initialContent={content} onChange={setContent}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Título del capítulo"
            placeholderTextColor={COLORS.textSecondary}
          />
        </RichTextEditor>
      </View>

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
      />

      <PopupMenu visible={isMenuVisible} items={menuItems} onClose={() => setIsMenuVisible(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.m },
  chapterSelector: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, maxWidth: CHAPTER_SELECTOR_MAX_WIDTH },
  chapterSelectorText: { flexShrink: 1, fontSize: FONTSIZE.m, fontWeight: "bold", color: COLORS.text },
  headerActions: { flexDirection: "row", alignItems: "center", gap: SPACING.m },
  headerAction: { fontSize: FONTSIZE.s, color: COLORS.primary },
  titleInput: {
    fontSize: FONTSIZE.xxl, fontWeight: "bold", color: COLORS.text,
    paddingTop: SPACING.m, paddingBottom: SPACING.s, paddingHorizontal: 0,
  },
  editor: { flex: 1 },
  footer: { flexDirection: "row", justifyContent: "space-between", paddingTop: SPACING.s },
  status: { color: COLORS.textSecondary, fontSize: FONTSIZE.xs },
  statusError: { color: COLORS.dangerText, fontSize: FONTSIZE.xs },
  errorText: { color: COLORS.dangerText, padding: SPACING.s },
})

export default ChapterEditorScreen