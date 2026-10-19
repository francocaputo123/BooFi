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

            setAuthData : ({ public_id,email,username,bio,photoUrl } : authTypes) => {
                set({
                    public_id : public_id,
                    email : email,
                    username : username,
                    bio : bio,
                    photoUrl : photoUrl,
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