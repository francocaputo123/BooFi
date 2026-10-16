import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ReadingState } from "@/types/reading.types";

// Se persiste en el dispositivo para que el progreso sobreviva al cerrar la app
const readingStore = create<ReadingState>()(
    persist(
        set => ({
            progressByKey : {},

            setProgress : (key, progress) => {
                set((state) => ({
                    progressByKey : {
                        ...state.progressByKey,
                        [key] : progress
                    }
                }))
            }
        }),
        {
            name : "readingStorage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)

export default readingStore
