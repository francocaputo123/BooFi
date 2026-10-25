import { DraftStatus } from "@/types/draft.types"

export const STATUS_LABELS: Record<DraftStatus, string> = {
  in_progress: "En curso",
  completed: "Completa",
}

/** Lista de estados para armar los chips de configuración sin repetirlos a mano */
export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as DraftStatus[]

/** Título con el que se crea una historia nueva hasta que el autor lo cambia */
export const DEFAULT_DRAFT_TITLE = "Sin título"