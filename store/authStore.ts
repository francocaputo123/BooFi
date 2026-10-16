import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authState, authTypes} from "@/types/auth.types";

const authStore = create<authState>()(
    persist(
        set => ({
            public_id : "",
            email : "",
            isAuthenticated : false,

            setAuthData : ({public_id,email} : authTypes) => {
                set({
                    public_id : public_id,
                    email : email,
                    isAuthenticated : true
                })
            },

            loggout : () => {
                set({
                    public_id : "",
                    email : "",
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