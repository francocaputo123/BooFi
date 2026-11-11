import { Draft } from "@/types/draft.types"
import { Chapter } from "@/types/chapter.types"
import { EpubBlock, EpubParsedBook } from "@/types/epub.types"
import { getDraftTitle } from "@/utils/getDraftTitle"
import richTextToBlocks from "@/utils/richTextToBlocks"

const PREVIEW_LENGTH = 200

/**
 * Convierte el texto de un capítulo en bloques: un párrafo por cada línea no vacía.
 * NOTE: solo para capítulos viejos, escritos antes del editor de texto enriquecido
 * @param string content : texto plano del capítulo
 * @returns EpubBlock[]
 */
const textToBlocks = (content: string): EpubBlock[] => {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line): EpubBlock => ({ type: "paragraph", spans: [{ text: line }] }))
}

/**
 * Convierte el contenido guardado de un capítulo en bloques del lector.
 * @param string content : JSON del editor, texto plano viejo o vacío
 * @returns EpubBlock[]
 */
export const contentToBlocks = (content: string): EpubBlock[] =>
  richTextToBlocks(content) ?? textToBlocks(content)

/**
 * Arma el adelanto de un capítulo con el texto de sus bloques, sin formato.
 * @param EpubBlock[] blocks : bloques del capítulo
 * @returns string
 */
const blocksToPreview = (blocks: EpubBlock[]): string =>
  blocks
    .map((block) => block.spans.map((span) => span.text).join(""))
    .join(" ")
    .slice(0, PREVIEW_LENGTH)

/**
 * Adapta una historia escrita en el editor al formato de libro que usan
 * la pantalla de publicar, la ficha y el lector.
 */
export const draftToBook = (draft: Draft, chapters: Chapter[], authorName: string): EpubParsedBook => {
  return {
    id: draft.id,
    title: getDraftTitle(draft),
    author: authorName,
    synopsis: draft.synopsis ?? "",
    coverUri: null,
    tags: draft.tags ?? [],
    chapters: chapters.map((chapter) => {
      const blocks = contentToBlocks(chapter.content)
      return {
        id: chapter.id,
        title: chapter.title,
        href: "",
        textPreview: blocksToPreview(blocks),
        blocks,
        access: chapter.access,
      }
    }),
  }
}