import { doc, getDoc } from "firebase/firestore"
import { db } from "@/config/firebaseConfig"

/* Coleccion de Firestore: profiles/{userId} */
export const PROFILES_COLLECTION = "profiles"

/**
 * Lee el username del perfil de un usuario.
 * Devuelve null si el perfil no existe, si no tiene username o si falla la lectura:
 * en cualquiera de esos casos el que llama decide como seguir.
 * @param userId : public_id del usuario (el mismo que usa authStore)
 * @returns string | null : username del perfil, o null
 */
export const fetchUsername = async (userId: string): Promise<string | null> => {
    try {
        const snapshot = await getDoc(doc(db, PROFILES_COLLECTION, userId))
        if (!snapshot.exists()) return null

        const data = snapshot.data()
        return typeof data.username === "string" && data.username.length > 0
            ? data.username
            : null
    } catch (error) {
        console.warn("[profileService] No se pudo leer el perfil:", error)
        return null
    }
}