import { View, Text, TextInput, ActivityIndicator, StyleSheet } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useChapterEditor } from "@/hooks/useChapterEditor"
import { SAVE_STATUS_LABELS } from "@/constants/chapterEditor"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

const ChapterEditorScreen = () => {
  const { draftId, chapterId } = useLocalSearchParams() as { draftId: string; chapterId: string }
  const { title, setTitle, content, setContent, isLoading, errorMessage, saveStatus } =
    useChapterEditor(draftId, chapterId)

  if (isLoading) {
    return <ActivityIndicator style={styles.center} color={COLORS.primary} />
  }

  if (errorMessage) {
    return <Text style={styles.errorText}>{errorMessage}</Text>
  }

  return (
    <View style={styles.container}>
      <Text style={saveStatus === "error" ? styles.statusError : styles.status}>
        {SAVE_STATUS_LABELS[saveStatus]}
      </Text>
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
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.m },
  status: { color: COLORS.textSecondary, fontSize: FONTSIZE.xs, textAlign: "right" },
  statusError: { color: COLORS.dangerText, fontSize: FONTSIZE.xs, textAlign: "right" },
  titleInput: {
    fontSize: FONTSIZE.xl, fontWeight: "bold", color: COLORS.text,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.s,
  },
  contentInput: { flex: 1, fontSize: FONTSIZE.m, color: COLORS.text, marginTop: SPACING.m },
  errorText: { color: COLORS.dangerText, padding: SPACING.m },
})

export default ChapterEditorScreen