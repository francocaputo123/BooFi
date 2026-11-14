import { useState } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"
import authStore from "@/store/authStore"
import { createDraft, changeDraftCover } from "@/services/draftService"

/**
 * Sube la portada de una historia recién creada. Si falla no cancela nada: avisa y sigue.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @param string coverUri : ruta local de la portada elegida
 */
const saveCoverOrWarn = async (uid: string, draftId: string, coverUri: string) => {
  try {
    await changeDraftCover(uid, draftId, coverUri)
  } catch {
    Alert.alert(
      "No se pudo guardar la portada",
      "La historia se creó igual. Podés agregar la portada desde Configuración."
    )
  }
}

/**
 * Crea una historia con los datos indicados y abre su editor.
 * @returns createAndOpenDraft, isCreating y errorMessage
 */
export const useCreateDraft = () => {
  const router = useRouter()
  const uid = authStore((state) => state.public_id)

  // Evita que un doble toque cree dos historias mientras Firestore responde
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  /**
   * @param string title : título inicial, puede ir vacío
   * @param string synopsis : descripción inicial, puede ir vacía
   * @param string | null coverUri : ruta local de la portada elegida, si hay una
   */
  const createAndOpenDraft = async (title: string, synopsis: string, coverUri: string | null = null) => {
    if (isCreating) return
    setIsCreating(true)
    setErrorMessage(null)
    try {
      const draftId = await createDraft(uid, title, synopsis)

      if (coverUri) await saveCoverOrWarn(uid, draftId, coverUri)

      // replace y no push: al volver atrás desde el editor no se debe regresar al formulario
      router.replace({ pathname: "/write/[draftId]", params: { draftId } })
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  return { createAndOpenDraft, isCreating, errorMessage }
}