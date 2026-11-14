import { Draft } from "@/types/draft.types"

/**
 * Indica qué datos le faltan a una historia para poder publicarse.
 * @param Draft draft : historia a revisar
 * @returns string[] : nombres de los datos faltantes, vacío si está completa
 */
export const getMissingPublishFields = (draft: Draft): string[] => {
  const missingFields: string[] = []

  if (!draft.title.trim()) {
    missingFields.push("título")
  }
  if (!draft.synopsis?.trim()) {
    missingFields.push("sinopsis")
  }
  if (!draft.tags || draft.tags.length === 0) {
    missingFields.push("al menos una categoría")
  }

  return missingFields
}