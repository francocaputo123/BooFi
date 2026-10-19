import { useEffect } from "react"
import authStore from "@/store/authStore"
import profileStore from "@/store/profileStore"

/**
 * Devuelve el username del usuario logueado (el autor que firma el libro).
 * Dispara la carga del perfil la primera vez y cachea el resultado en profileStore.
 * @returns string : username, o cadena vacia mientras carga o si el perfil no existe
 */
export const useAuthorName = (): string => {
    const userId = authStore((state) => state.public_id)
    const username = profileStore((state) => state.usernamesByUserId[userId])
    const loadUsername = profileStore((state) => state.loadUsername)

    useEffect(() => {
        if (userId) loadUsername(userId)
    }, [userId, loadUsername])

    return username ?? ""
}