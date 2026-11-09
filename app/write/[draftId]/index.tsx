import { useEffect, useRef, useState } from "react"
import { Text, ActivityIndicator, StyleSheet } from "react-native"
import { useLocalSearchParams, useRouter, Href } from "expo-router"
import authStore from "@/store/authStore"
import { createChapter, listChapters } from "@/services/chapterService"
import { COLORS, SPACING } from "@/constants/theme"

/** Punto de entrada de una historia: abre el último capítulo, o crea el primero si no hay ninguno */
const DraftEntryScreen = () => {
  const { draftId } = useLocalSearchParams() as { draftId: string }
  const uid = authStore((state) => state.public_id)
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Evita crear dos primeros capítulos si el efecto corriera dos veces
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const openLastChapter = async () => {
      try {
        const chapters = await listChapters(uid, draftId)
        const lastChapter = chapters[chapters.length - 1]
        const chapterId = lastChapter
          ? lastChapter.id
          : await createChapter(uid, draftId, "Capítulo 1", 1)
        router.replace(`/write/${draftId}/${chapterId}` as Href)
      } catch (error) {
        setErrorMessage((error as Error).message)
      }
    }
    openLastChapter()
  }, [uid, draftId])

  if (errorMessage) {
    return <Text style={styles.errorText}>{errorMessage}</Text>
  }

  return <ActivityIndicator style={styles.center} color={COLORS.primary} />
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  errorText: { color: COLORS.dangerText, padding: SPACING.m },
})

export default DraftEntryScreen