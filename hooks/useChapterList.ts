import { useCallback, useState } from "react"
import authStore from "@/store/authStore"
import { Chapter } from "@/types/chapter.types"
import { createChapter, listChapters, deleteChapter, swapChapterOrder } from "@/services/chapterService"

/**
 * Maneja los capítulos de una historia: carga, alta, orden y baja.
 * @param string draftId : id de la historia
 * @returns chapters, isBusy, errorMessage y las acciones loadChapters, addChapter, moveChapter, removeChapter
 */
export const useChapterList = (draftId: string) => {
  const uid = authStore((state) => state.public_id)

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Evita que un doble toque dispare dos operaciones a la vez
  const [isBusy, setIsBusy] = useState(false)

  const loadChapters = useCallback(async () => {
    try {
      setErrorMessage(null)
      setChapters(await listChapters(uid, draftId))
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }, [uid, draftId])

  /** Crea un capítulo al final. Devuelve su id, o null si falló o hay otra operación en curso */
  const addChapter = async (): Promise<string | null> => {
    if (isBusy) return null
    setIsBusy(true)
    try {
      const lastChapter = chapters[chapters.length - 1]
      const nextOrder = lastChapter ? lastChapter.order + 1 : 1
      const chapterId = await createChapter(uid, draftId, "", nextOrder)
      await loadChapters()
      return chapterId
    } catch (error) {
      setErrorMessage((error as Error).message)
      return null
    } finally {
      setIsBusy(false)
    }
  }

  /** Intercambia el capítulo de la posición index con su vecino (-1 sube, 1 baja) */
  const moveChapter = async (index: number, direction: -1 | 1) => {
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

  /** Borra un capítulo. Devuelve true si se pudo borrar */
  const removeChapter = async (chapter: Chapter): Promise<boolean> => {
    try {
      await deleteChapter(uid, draftId, chapter.id)
      await loadChapters()
      return true
    } catch (error) {
      setErrorMessage((error as Error).message)
      return false
    }
  }

  return { chapters, isBusy, errorMessage, loadChapters, addChapter, moveChapter, removeChapter }
}