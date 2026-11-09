import { useCallback, useState } from "react"
import { useFocusEffect } from "expo-router"
import authStore from "@/store/authStore"
import { listDrafts } from "@/services/draftService"
import { listChapters } from "@/services/chapterService"
import { Draft } from "@/types/draft.types"

/**
 * Trae la historia en la que se escribió por última vez y cuántos capítulos tiene.
 * NOTE: se recarga cada vez que la pantalla recupera el foco, para reflejar lo escrito recién.
 * TODO: pedir sólo una historia a Firestore (limit 1) en lugar de listarlas todas
 * @returns latestDraft, chapterCount, isLoading y errorMessage
 */
export const useLatestDraft = () => {
  const uid = authStore((state) => state.public_id)

  const [latestDraft, setLatestDraft] = useState<Draft | null>(null)
  const [chapterCount, setChapterCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      const loadLatestDraft = async () => {
        try {
          setErrorMessage(null)
          const drafts = await listDrafts(uid)
          const mostRecent = drafts[0] ?? null
          setLatestDraft(mostRecent)
          setChapterCount(mostRecent ? (await listChapters(uid, mostRecent.id)).length : 0)
        } catch (error) {
          setErrorMessage((error as Error).message)
        } finally {
          setIsLoading(false)
        }
      }
      loadLatestDraft()
    }, [uid])
  )

  return { latestDraft, chapterCount, isLoading, errorMessage }
}