import { ChapterAccess } from "@/types/chapter.types"

/** Nombre visible de cada tipo de acceso */
export const ACCESS_LABELS: Record<ChapterAccess, string> = {
  free: "Gratis",
  paid: "Pago Individual",
}

/** Acceso que se asume cuando un capítulo no lo trae definido */
export const DEFAULT_CHAPTER_ACCESS: ChapterAccess = "free"