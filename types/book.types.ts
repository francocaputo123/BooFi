import { EpubBlock, EpubParsedBook } from "./epub.types"
export interface Book {
    id: string
    title: string
    author: string
}

/*
 * Libros ya cargados (por ahora solo .epub) disponibles en memoria.
 */
export interface BookState {
    booksById: Record<string, EpubParsedBook>
    saveBook: (book: EpubParsedBook) => void
}

/*
 * Visibilidad de un libro publicado. "paid" todavia no funciona:
 * se deja en el tipo para no tener que migrar libros mas adelante.
 */
export type BookVisibility = "public" | "paid"

/* Resumen de un capitulo dentro del libro: solo numero y titulo, sin texto */
export interface PublishedChapterSummary {
    index: number
    title: string
}

/* Lo que se guarda en Firestore: documento books/{bookId} */
export interface PublishedBookData {
    authorId: string
    authorName: string
    title: string
    /* Titulo normalizado: sirve para detectar duplicados del mismo autor */
    titleKey: string
    synopsis: string
    /* Categorias elegidas por el autor (ver AVAILABLE_TAGS) */
    tags: string[]
    /* Link a la portada que esta en Cloud Storage, o null si el epub no trae */
    coverUrl: string | null
    visibility: BookVisibility
    /* Fecha ISO de publicacion */
    publishedAt: string
    /*
     * NOTE: autor original del epub (dc:creator). NO se muestra en la app.
     * Se conserva por si en algun momento se necesita el dato original de la obra.
     */
    originalAuthor: string
    /* Lista liviana: asi la ficha muestra los capitulos sin bajar ningun texto */
    chapters: PublishedChapterSummary[]
}

/* Lo que devuelve la app al leer: los datos mas el id del documento */
export interface PublishedBook extends PublishedBookData {
    id: string
}

/*
 * Un capitulo completo. Se guarda como archivo JSON en Cloud Storage
 * (books/{bookId}/chapters/0000.json) y se baja de a uno al leer.
 */
export interface PublishedChapter {
    index: number
    title: string
    blocks: EpubBlock[]
}

/* Lo que necesita publishBook para publicar un libro */
export interface PublishBookParams {
    authorId: string
    authorName: string
    book: EpubParsedBook
    synopsis: string
    tags: string[]
    /* Portada ya achicada, en base64 y formato JPEG. Solo viaja hasta Storage: no se guarda en Firestore */
    coverJpegBase64: string | null
    visibility: BookVisibility
}

/* "duplicate": el usuario ya tenia publicado un libro con ese titulo y no se subio nada */
export interface PublishBookResult {
    status: "published" | "duplicate"
    bookId: string
}