import {
    CHAPTER_FILE_DIGITS,
    STORAGE_BOOKS_FOLDER,
    STORAGE_CHAPTERS_FOLDER,
    STORAGE_COVER_FILE_NAME,
    STORAGE_IMAGES_FOLDER,
} from "@/data/publishData"

/**
 * Ruta de la portada de un libro dentro de Cloud Storage.
 * @param bookId : id del libro publicado
 * @returns string : ej "books/abc123_x9k/cover.jpg"
 */
export const buildCoverPath = (bookId: string): string => {
    return `${STORAGE_BOOKS_FOLDER}/${bookId}/${STORAGE_COVER_FILE_NAME}`
}

/**
 * Ruta del archivo JSON de un capitulo dentro de Cloud Storage.
 * @param bookId : id del libro publicado
 * @param chapterIndex : posicion del capitulo (empieza en 0)
 * @returns string : ej "books/abc123_x9k/chapters/0003.json"
 */
export const buildChapterPath = (bookId: string, chapterIndex: number): string => {
    const fileNumber = String(chapterIndex).padStart(CHAPTER_FILE_DIGITS, "0")
    return `${STORAGE_BOOKS_FOLDER}/${bookId}/${STORAGE_CHAPTERS_FOLDER}/${fileNumber}.json`
}

/**
 * Ruta de una imagen de capitulo dentro de Cloud Storage.
 * Todas las imagenes publicadas van en JPEG, por eso el archivo siempre termina en .jpg.
 * @param bookId : id del libro publicado
 * @param chapterIndex : posicion del capitulo (empieza en 0)
 * @param imageIndex : posicion de la imagen dentro del capitulo (empieza en 0)
 * @returns string : ej "books/abc123_x9k/images/0003-0001.jpg"
 */
export const buildChapterImagePath = (
    bookId: string,
    chapterIndex: number,
    imageIndex: number
): string => {
    const chapterNumber = String(chapterIndex).padStart(CHAPTER_FILE_DIGITS, "0")
    const imageNumber = String(imageIndex).padStart(CHAPTER_FILE_DIGITS, "0")
    return `${STORAGE_BOOKS_FOLDER}/${bookId}/${STORAGE_IMAGES_FOLDER}/${chapterNumber}-${imageNumber}.jpg`
}