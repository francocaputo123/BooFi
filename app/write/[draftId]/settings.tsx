import { useEffect, useState } from "react"
import { Text, TextInput, Pressable, ActivityIndicator, ScrollView, View, StyleSheet } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import authStore from "@/store/authStore"
import { getDraft, updateDraft } from "@/services/draftService"
import { DraftStatus } from "@/types/draft.types"
import { AVAILABLE_TAGS, BookTag } from "@/data/publishData"
import { STATUS_LABELS, STATUS_OPTIONS } from "@/constants/draftOptions"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import ChipOption from "@/components/ChipOption"

/** Descarta valores que ya no existan en AVAILABLE_TAGS */
const isBookTag = (value: unknown): value is BookTag =>
  (AVAILABLE_TAGS as readonly unknown[]).includes(value)

const DraftSettingsScreen = () => {
  const { draftId } = useLocalSearchParams() as { draftId: string }
  const uid = authStore((state) => state.public_id)
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [synopsis, setSynopsis] = useState("")
  const [tags, setTags] = useState<BookTag[]>([])
  const [status, setStatus] = useState<DraftStatus>("in_progress")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await getDraft(uid, draftId)
        setTitle(draft.title)
        setSynopsis(draft.synopsis ?? "")
        setTags((draft.tags ?? []).filter(isBookTag))
        setStatus(draft.status)
      } catch (error) {
        setLoadError((error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    loadDraft()
  }, [uid, draftId])

  const toggleTag = (tag: BookTag) => {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    )
  }

  const handleSave = async () => {
    if (title.trim() === "") {
      setSaveError("El título no puede estar vacío")
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateDraft(uid, draftId, { title: title.trim(), synopsis: synopsis.trim(), status, tags })
      router.back()
    } catch (error) {
      setSaveError((error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <ActivityIndicator style={styles.center} color={COLORS.primary} />
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{loadError}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Título de la historia"
        placeholderTextColor={COLORS.textSecondary}
      />

      <Text style={styles.label}>Sinopsis</Text>
      <TextInput
        style={[styles.input, styles.synopsisInput]}
        value={synopsis}
        onChangeText={setSynopsis}
        placeholder="¿De qué trata tu historia?"
        placeholderTextColor={COLORS.textSecondary}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Categorías</Text>
      <View style={styles.chipRow}>
        {AVAILABLE_TAGS.map((tag) => (
          <ChipOption key={tag} label={tag} isSelected={tags.includes(tag)} onPress={() => toggleTag(tag)} />
        ))}
      </View>

      <Text style={styles.label}>Estado</Text>
      <View style={styles.chipRow}>
        {STATUS_OPTIONS.map((option) => (
          <ChipOption
            key={option}
            label={STATUS_LABELS[option]}
            isSelected={status === option}
            onPress={() => setStatus(option)}
          />
        ))}
      </View>

      {saveError && <Text style={styles.errorText}>{saveError}</Text>}

      <Pressable
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>Guardar cambios</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.m },
  label: { fontSize: FONTSIZE.s, color: COLORS.textSecondary, marginTop: SPACING.m, marginBottom: SPACING.s },
  input: {
    fontSize: FONTSIZE.m, color: COLORS.text, backgroundColor: COLORS.surface,
    borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, padding: SPACING.m,
  },
  synopsisInput: { minHeight: 100 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.s },
  errorText: { color: COLORS.dangerText, marginTop: SPACING.m },
  saveButton: {
    backgroundColor: COLORS.primary, padding: SPACING.m, borderRadius: 8,
    alignItems: "center", marginTop: SPACING.l,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#fff", fontSize: FONTSIZE.m },
})

export default DraftSettingsScreen