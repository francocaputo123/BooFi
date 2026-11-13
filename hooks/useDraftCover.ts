import { useState } from "react"
import authStore from "@/store/authStore"
import { changeDraftCover, removeDraftCover } from "@/services/draftService"
import { pickCoverImage } from "@/utils/pickCoverImage"
import { DraftCover } from "@/types/draft.types"

/**
 * Maneja la portada de una historia ya creada: elegir una nueva y quitarla.
 * La portada se guarda en el momento, sin esperar al botón "Guardar" de la pantalla.
 * @param string draftId : id de la historia
 * @returns cover, setCover (para cargar la portada que ya tenía), isBusy, errorMessage, pickCover y removeCover
 */
export const useDraftCover = (draftId: string) => {
  const uid = authStore((state) => state.public_id)

  const [cover, setCover] = useState<DraftCover | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  /**
   * Corre una acción sobre la portada mostrando el estado de carga y el error si falla.
   * @param () => Promise<void> action : lo que se hace con la portada
   */
  const runCoverAction = async (action: () => Promise<void>) => {
    setIsBusy(true)
    setErrorMessage(null)
    try {
      await action()
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsBusy(false)
    }
  }

  const pickCover = async () => {
    const pickedUri = await pickCoverImage()
    if (!pickedUri) return
    await runCoverAction(async () => {
      setCover(await changeDraftCover(uid, draftId, pickedUri, cover?.coverPath))
    })
  }

  const removeCover = async () => {
    if (!cover) return
    await runCoverAction(async () => {
      await removeDraftCover(uid, draftId, cover.coverPath)
      setCover(null)
    })
  }

  return { cover, setCover, isBusy, errorMessage, pickCover, removeCover }
}