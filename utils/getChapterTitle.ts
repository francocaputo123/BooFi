import { Chapter } from "@/types/chapter.types"

/**
 * Título para mostrar de un capítulo, con "Capítulo N" de respaldo si todavía no tiene.
 * NOTE: en la base el título queda vacío hasta que el autor lo escribe
 * @param object chapter : capítulo con su título
 * @param number position : posición del capítulo en la historia (empieza en 1, 0 si todavía no se sabe)
 * @returns string : título escrito o "Capítulo N"
 */
export const getChapterTitle = (chapter: Pick<Chapter, "title">, position: number): string =>
  chapter.title.trim() || (position > 0 ? `Capítulo ${position}` : "Capítulo")