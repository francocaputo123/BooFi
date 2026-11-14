import { collection, DocumentData, getDocs, limit, orderBy, query, QueryDocumentSnapshot, where } from "firebase/firestore"
import { db } from "@/config/firebaseConfig"
import { CatalogBook } from "@/types/catalog.types"
import { BOOKS_COLLECTION, CATALOG_FETCH_LIMIT, CATALOG_LABELS } from "@/data/catalogData"

/*
 * Convierte un documento de Firestore en un CatalogBook.
 * Se valida cada campo porque Firestore no garantiza la forma de los datos
 * (por ejemplo, un libro cargado a mano puede no traer "tags" o "price").
 */
const mapBookDocument = (snapshot: QueryDocumentSnapshot<DocumentData>): CatalogBook => {
    const data = snapshot.data()

    return {
        id: snapshot.id,
        title: typeof data.title === "string" ? data.title : "",
        authorName: typeof data.authorName === "string" ? data.authorName : "",
        coverUrl: typeof data.coverUrl === "string" ? data.coverUrl : null,
        tags: Array.isArray(data.tags) ? data.tags.filter((tag: unknown): tag is string => typeof tag === "string") : [],
        // Los libros viejos no traen "visibility": se tratan como gratis
        visibility: data.visibility === "paid" ? "paid" : "public",
        // Solo se acepta un entero positivo; cualquier otra cosa se trata como "sin precio"
        price: Number.isInteger(data.price) && data.price > 0 ? data.price : null,
        chapterCount: Array.isArray(data.chapters) ? data.chapters.length : 0,
    }
}

/**
 * Baja el catalogo de libros, los mas nuevos primero.
 * Se ordena en el servidor por un solo campo (publishedAt), que no necesita indice compuesto.
 * NOTE: los libros sin publishedAt no aparecen, porque orderBy excluye los documentos que no tienen ese campo.
 * @returns CatalogBook[] : hasta CATALOG_FETCH_LIMIT libros
 */
export const fetchCatalogBooks = async (): Promise<CatalogBook[]> => {
    try {
        const booksQuery = query(
            collection(db, BOOKS_COLLECTION),
            orderBy("publishedAt", "desc"),
            limit(CATALOG_FETCH_LIMIT)
        )
        const snapshot = await getDocs(booksQuery)
        return snapshot.docs.map(mapBookDocument)
    } catch (error) {
        console.error("[catalogService] No se pudo leer el catalogo:", error)
        throw new Error(CATALOG_LABELS.LOAD_ERROR)
    }
}

/*
 * Fecha ISO de publicación de un documento, o "" si no la trae.
 * Sirve para ordenar los libros de un autor sin pedir un índice compuesto a Firestore.
 */
const getPublishedAt = (snapshot: QueryDocumentSnapshot<DocumentData>): string => {
    const publishedAt = snapshot.data().publishedAt
    return typeof publishedAt === "string" ? publishedAt : ""
}

/**
 * Baja los libros que publicó un autor, los mas nuevos primero.
 * NOTE: se filtra por un solo campo (authorId) y se ordena aca: ordenar en Firestore pediria un indice compuesto.
 * @param authorId : uid de quien publico
 * @returns CatalogBook[] : libros del autor
 */
export const fetchAuthorBooks = async (authorId: string): Promise<CatalogBook[]> => {
    try {
        const snapshot = await getDocs(
            query(collection(db, BOOKS_COLLECTION), where("authorId", "==", authorId))
        )
        return [...snapshot.docs]
            .sort((first, second) => getPublishedAt(second).localeCompare(getPublishedAt(first)))
            .map(mapBookDocument)
    } catch (error) {
        console.error("[catalogService] No se pudieron leer los libros del autor:", error)
        throw new Error(CATALOG_LABELS.LOAD_ERROR)
    }
}