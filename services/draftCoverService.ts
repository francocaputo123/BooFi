import { ref, getDownloadURL, deleteObject } from "firebase/storage"
import * as Crypto from "expo-crypto"
import { storage } from "@/config/firebaseConfig"
import { uploadBase64Jpeg } from "@/services/bookService"
import { prepareCover } from "@/utils/prepareCover"
import { handleFirebaseError } from "@/utils/handleFirebaseError"
import { DraftCover } from "@/types/draft.types"

/**
 * Ruta de la portada de una historia dentro de Cloud Storage.
 * Lleva un id distinto en cada subida: así, al cambiar la portada, la app no muestra la vieja guardada en caché.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @returns string : ej "users/abc/drafts/xyz/cover-4f1c....jpg"
 */
const buildDraftCoverPath = (uid: string, draftId: string): string =>
  `users/${uid}/drafts/${draftId}/cover-${Crypto.randomUUID()}.jpg`

/**
 * Achica la imagen elegida y la sube a Storage como portada de la historia.
 * NOTE: solo toca Storage. Guardar el link en la historia es trabajo de draftService
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @param string localUri : ruta local de la imagen elegida en la galería
 * @returns DraftCover : link y ruta de la portada subida
 */
export const uploadDraftCover = async (uid: string, draftId: string, localUri: string): Promise<DraftCover> => {
  const coverBase64 = await prepareCover(localUri)

  // Fuera del try: dentro, handleFirebaseError taparía este mensaje con uno genérico
  if (!coverBase64) {
    throw new Error("No se pudo preparar la imagen. Probá con otra.")
  }

  try {
    const coverPath = buildDraftCoverPath(uid, draftId)
    const coverRef = ref(storage, coverPath)
    await uploadBase64Jpeg(coverRef, coverBase64)
    const coverUrl = await getDownloadURL(coverRef)
    return { coverUrl, coverPath }
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}

/**
 * Borra una portada de Storage. Si falla no corta nada: a lo sumo queda un archivo suelto.
 * @param string coverPath : ruta de la portada en Storage
 */
export const deleteDraftCover = async (coverPath: string) => {
  try {
    await deleteObject(ref(storage, coverPath))
  } catch (error) {
    console.warn("[draftCoverService] No se pudo borrar la portada:", error)
  }
}