import { SaveStatus } from "@/types/chapter.types"

export const SAVE_STATUS_LABELS: Record<SaveStatus, string> = {
  saved: "Guardado",
  pending: "Cambios sin guardar...",
  saving: "Guardando...",
  error: "No se pudo guardar",
}

/** Espera sin escribir antes de guardar, para no hacer una escritura por tecla */
export const AUTOSAVE_DELAY_MS = 1500