import { useState } from "react"
import { useRouter } from "expo-router"
import authStore from "@/store/authStore"
import { createDraft } from "@/services/draftService"

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

  const createAndOpenDraft = async (title: string, synopsis: string) => {
    if (isCreating) return
    setIsCreating(true)
    setErrorMessage(null)
    try {
      const draftId = await createDraft(uid, title, synopsis)
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