import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authTypes } from "@/types/auth.types";

const authStore = create(
    persist(
        set => ({
            email : "",
            password : "",
            isAuthenticated : false,

            setAuthData : ({email, password} : authTypes) => {
                set({
                    email : email,
                    password : password,
                    isAuthenticated : true
                })
            },

            loggout : () => {
                set({
                    email : "",
                    password : "",
                    isAuthenticated : false
                })
            }
        }),
        {
            name : "authStorage"
        }
    )
)

export default authStore