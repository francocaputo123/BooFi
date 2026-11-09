import { DraftStatus } from "@/types/draft.types"

export const STATUS_LABELS: Record<DraftStatus, string> = {
  in_progress: "En curso",
  completed: "Completa",
}

/** Lista de estados para armar los chips de configuración sin repetirlos a mano */
export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as DraftStatus[]

/** Texto que se muestra cuando una historia no tiene título; en la base el título queda vacío */
export const UNTITLED_DRAFT_LABEL = "Sin título"