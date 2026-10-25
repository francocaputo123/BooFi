import { Timestamp } from "firebase/firestore"
import { BookTag } from "@/data/publishData"

export type DraftStatus = "in_progress" | "completed"

export interface Draft {
  id: string
  title: string
  status: DraftStatus
  /** Categorías elegidas, deben pertenecer a AVAILABLE_TAGS */
  tags?: BookTag[]
  synopsis?: string
  updatedAt: Timestamp
}