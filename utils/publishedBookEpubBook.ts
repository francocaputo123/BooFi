import { PublishedBook } from "@/types/book.types"
import { EpubParsedBook } from "@/types/epub.types"

/**
 * Adapta un libro publicado (Firestore) al formato que usan la ficha y el lector.
 * Los capitulos salen con "blocks" vacios: el texto se baja recien al leer.
 */
export const publishedBookToEpubBook = (published: PublishedBook): EpubParsedBook => {
    return {
        id: published.id,
        title: published.title,
        author: published.authorName,
        synopsis: published.synopsis,
        coverUri: published.coverUrl,
        tags: published.tags,
        isPublished: true,
        isContentLoaded: false,
        chapters: published.chapters.map((chapter) => ({
            id: String(chapter.index),
            title: chapter.title,
            href: "",
            textPreview: "",
            blocks: [],
            access: chapter.access,
        })),
    }
}