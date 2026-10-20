import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authState, authTypes} from "@/types/auth.types";

const authStore = create<authState>()(
    persist(
        set => ({
            public_id : "",
            email : "",
            username : "",
            bio : "",
            photoUrl : "",
            isAuthenticated : false,

            setAuthData : ( data: Partial<authTypes>) => {
                set({
                    ...data,
                    isAuthenticated : true
                })
            },

            setPhoto : ({ photoUrl } : Partial<authTypes>) => {
                set({
                    photoUrl : photoUrl
                })
            },

            loggout : () => {
                set({
                    public_id : "",
                    email : "",
                    username : "",
                    bio : "",
                    photoUrl : "",
                    isAuthenticated : false
                })
            }
        }),
        {
            name : "authStorage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)

export default authStore