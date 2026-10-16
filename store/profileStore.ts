import { create } from "zustand"
import { fetchUsername } from "@/services/profileService"

interface ProfileState {
    /* Username cacheado por userId. Se llena on-demand la primera vez que se pide */
    usernamesByUserId: Record<string, string>
    loadUsername: (userId: string) => Promise<string | null>
}

const profileStore = create<ProfileState>()((set, get) => ({
    usernamesByUserId: {},

    loadUsername: async (userId) => {
        if (!userId) return null

        const cached = get().usernamesByUserId[userId]
        if (cached) return cached

        const username = await fetchUsername(userId)
        if (username) {
            set((state) => ({
                usernamesByUserId: { ...state.usernamesByUserId, [userId]: username },
            }))
        }
        return username
    },
}))

export default profileStore