import { normalizeTitle } from "@/utils/normalizeTitle"

/*
 * Hash djb2: alcanza para distinguir unos pocos libros sin sumar dependencias
 */
const hashText = (text: string): string => {
    let hash = 5381
    for (let index = 0; index < text.length; index++) {
        hash = ((hash * 33) ^ text.charCodeAt(index)) >>> 0
    }
    return hash.toString(36)
}

/**
 * Genera un id estable a partir de titulo y autor.
 * Se hace asi (y no con un contador) para que, si el usuario vuelve a cargar el mismo
 * .epub, se reconozca el libro y se recupere su progreso de lectura.
 * @param title : titulo del libro
 * @param author : autor del libro
 * @returns string : id con formato "epub-<hash>"
 */
export const buildBookId = (title: string, author: string): string => {
    const normalizedText = `${title}|${author}`.replace(/\s+/g, " ").trim().toLowerCase()
    return `epub-${hashText(normalizedText)}`
}

/**
 * Genera el id con el que se publica un libro en Firebase: "<uid>_<hash del titulo>".
 * Lleva el uid de quien publica, entonces:
 * - el mismo usuario con el mismo titulo siempre da el mismo id (sirve para detectar duplicados)
 * - dos usuarios distintos con el mismo libro dan ids distintos (no se pisan entre ellos)
 * @param authorId : uid de Firebase Auth de quien publica
 * @param title : titulo del libro
 * @returns string : ej "Xk3j9aQ_1b2c3d"
 */
export const buildPublishedBookId = (authorId: string, title: string): string => {
    return `${authorId}_${hashText(normalizeTitle(title))}`
}