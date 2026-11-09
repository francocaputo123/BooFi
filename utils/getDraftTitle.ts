import { Draft } from "@/types/draft.types"
import { UNTITLED_DRAFT_LABEL } from "@/constants/draftOptions"

/**
 * Título para mostrar de una historia, con un texto de respaldo si todavía no tiene.
 * @param object draft : historia con su título
 * @returns string : título guardado o UNTITLED_DRAFT_LABEL
 */
export const getDraftTitle = (draft: Pick<Draft, "title">): string =>
  draft.title.trim() || UNTITLED_DRAFT_LABEL