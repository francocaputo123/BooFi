import { useEffect, useRef, useState } from "react"
import authStore from "@/store/authStore"
import { getChapter, updateChapter } from "@/services/chapterService"
import { SaveStatus } from "@/types/chapter.types"
import { AUTOSAVE_DELAY_MS } from "@/constants/chapterEditor"

/**
 * Carga un capítulo y lo guarda solo: con una pausa al escribir y al salir de la pantalla
 * @param string draftId : id de la historia
 * @param string chapterId : id del capítulo
 * @returns título, contenido, sus setters y los estados de carga, error y guardado
 */
export const useChapterEditor = (draftId: string, chapterId: string) => {
  const uid = authStore((state) => state.public_id)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")

  // NOTE: la limpieza al salir corre con valores viejos del primer render, por eso lee los refs
  const latest = useRef({ title: "", content: "" })
  latest.current = { title, content }

  // Lo último guardado en Firestore: evita escribir cuando no hubo cambios
  const lastSaved = useRef({ title: "", content: "" })

  const hasUnsavedChanges = (currentTitle: string, currentContent: string) =>
    currentTitle !== lastSaved.current.title || currentContent !== lastSaved.current.content

  useEffect(() => {
    const loadChapter = async () => {
      try {
        const chapter = await getChapter(uid, draftId, chapterId)
        lastSaved.current = { title: chapter.title, content: chapter.content }
        setTitle(chapter.title)
        setContent(chapter.content)
      } catch (error) {
        setErrorMessage((error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    loadChapter()
  }, [uid, draftId, chapterId])

  // Cada cambio reinicia el reloj: sólo se guarda cuando el usuario deja de escribir
  useEffect(() => {
    if (isLoading || errorMessage || !hasUnsavedChanges(title, content)) return

    setSaveStatus("pending")
    const timer = setTimeout(async () => {
      try {
        setSaveStatus("saving")
        await updateChapter(uid, draftId, chapterId, { title, content })
        lastSaved.current = { title, content }
        setSaveStatus("saved")
      } catch {
        setSaveStatus("error")
      }
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [title, content])

  // La limpieza del efecto anterior cancela el reloj al salir, así que se guarda lo pendiente acá
  useEffect(() => {
    return () => {
      const { title: pendingTitle, content: pendingContent } = latest.current
      if (hasUnsavedChanges(pendingTitle, pendingContent)) {
        // NOTE: la pantalla ya no existe, no hay dónde mostrar un error
        updateChapter(uid, draftId, chapterId, { title: pendingTitle, content: pendingContent }).catch(() => {})
      }
    }
  }, [])

  return { title, setTitle, content, setContent, isLoading, errorMessage, saveStatus }
}