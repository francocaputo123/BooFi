import { Timestamp } from "firebase/firestore"
import { BookTag } from "@/data/publishData"

export type DraftStatus = "in_progress" | "completed"

/** Portada de una historia: el link para mostrarla y la ruta en Storage para poder borrarla */
export interface DraftCover {
  coverUrl: string
  coverPath: string
}

export interface Draft extends Partial<DraftCover> {
  id: string
  title: string
  status: DraftStatus
  /** Categorías elegidas, deben pertenecer a AVAILABLE_TAGS */
  tags?: BookTag[]
  synopsis?: string
  updatedAt: Timestamp
}