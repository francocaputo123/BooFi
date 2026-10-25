import { Timestamp } from "firebase/firestore"

/** Quién puede leer un capítulo: todos, suscriptores o quien lo compre */
export type ChapterAccess = "free" | "premium" | "paid"

export interface Chapter {
  id: string
  /** Posición del capítulo dentro de la historia, empieza en 1 */
  order: number
  title: string
  content: string
  access: ChapterAccess
  updatedAt: Timestamp
}

/** Estado del autoguardado que se muestra arriba del editor */
export type SaveStatus = "saved" | "pending" | "saving" | "error"