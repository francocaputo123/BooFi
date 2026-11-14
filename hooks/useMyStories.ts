import { useCallback, useState } from "react"
import { useFocusEffect } from "expo-router"
import authStore from "@/store/authStore"
import { listDrafts, deleteDraft } from "@/services/draftService"
import { fetchAuthorBooks } from "@/services/catalogService"
import { Draft } from "@/types/draft.types"
import { CatalogBook } from "@/types/catalog.types"
import { getDraftTitle } from "@/utils/getDraftTitle"
import { buildPublishedBookId } from "@/utils/buildBookId"

/**
 * Trae las historias del autor separadas en publicadas y borradores sin publicar.
 * NOTE: un borrador cuenta como publicado si existe un libro publicado con el id que
 * saldría de su título; es la misma regla con la que publishBook detecta duplicados.
 * Se recarga cada vez que la pantalla recupera el foco, para reflejar lo recién publicado.
 * @returns publishedBooks, unpublishedDrafts, isLoading, errorMessage y removeDraft
 */
export const useMyStories = () => {
  const uid = authStore((state) => state.public_id)

  const [publishedBooks, setPublishedBooks] = useState<CatalogBook[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadStories = useCallback(async () => {
    try {
      setErrorMessage(null)
      const [books, allDrafts] = await Promise.all([fetchAuthorBooks(uid), listDrafts(uid)])
      setPublishedBooks(books)
      setDrafts(allDrafts)
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [uid])

  // Una pestaña no se vuelve a montar al volver a ella: useFocusEffect recarga cada vez que recupera el foco
  useFocusEffect(
    useCallback(() => {
      loadStories()
    }, [loadStories])
  )

  const publishedIds = new Set(publishedBooks.map((book) => book.id))
  const unpublishedDrafts = drafts.filter(
    (draft) => !publishedIds.has(buildPublishedBookId(uid, getDraftTitle(draft)))
  )

  /** Borra un borrador y lo saca de la lista; si falla deja el mensaje de error */
  const removeDraft = async (draft: Draft) => {
    try {
      await deleteDraft(uid, draft.id)
      setDrafts((current) => current.filter((item) => item.id !== draft.id))
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  return { publishedBooks, unpublishedDrafts, isLoading, errorMessage, removeDraft }
}