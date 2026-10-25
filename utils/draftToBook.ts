import { Draft } from "@/types/draft.types"
import { Chapter } from "@/types/chapter.types"
import { EpubBlock, EpubParsedBook } from "@/types/epub.types"

/**
 * Convierte el texto de un capitulo en bloques: un parrafo por cada linea no vacia.
 * TODO: cuando se haga RF6.3, convertir las marcas ** y _ en spans con bold/italic
 */
const textToBlocks = (content: string): EpubBlock[] => {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line): EpubBlock => ({ type: "paragraph", spans: [{ text: line }] }))
}

/**
 * Adapta una historia escrita en el editor al formato de libro que usan
 * la pantalla de publicar, la ficha y el lector.
 */
export const draftToBook = (draft: Draft, chapters: Chapter[], authorName: string): EpubParsedBook => {
  return {
    id: draft.id,
    title: draft.title,
    author: authorName,
    synopsis: draft.synopsis ?? "",
    coverUri: null,
    tags: draft.tags ?? [],
    chapters: chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      href: "",
      textPreview: chapter.content.slice(0, 200),
      blocks: textToBlocks(chapter.content),
      access: chapter.access,
    })),
  }
}