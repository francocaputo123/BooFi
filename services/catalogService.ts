import { collection, DocumentData, getDocs, limit, orderBy, query, QueryDocumentSnapshot } from "firebase/firestore"
import { db } from "@/config/firebaseConfig"
import { CatalogBook } from "@/types/catalog.types"
import { BOOKS_COLLECTION, CATALOG_FETCH_LIMIT, CATALOG_LABELS, DEFAULT_BOOK_STATUS } from "@/data/catalogData"

/*
 * Convierte un documento de Firestore en un CatalogBook.
 * Se valida cada campo porque Firestore no garantiza la forma de los datos
 * (por ejemplo, un libro cargado a mano puede no traer "tags" o "status").
 */
const mapBookDocument = (snapshot: QueryDocumentSnapshot<DocumentData>): CatalogBook => {
    const data = snapshot.data()

    return {
        id: snapshot.id,
        title: typeof data.title === "string" ? data.title : "",
        authorName: typeof data.authorName === "string" ? data.authorName : "",
        coverUrl: typeof data.coverUrl === "string" ? data.coverUrl : null,
        tags: Array.isArray(data.tags) ? data.tags.filter((tag: unknown): tag is string => typeof tag === "string") : [],
        status: data.status === "completed" ? "completed" : DEFAULT_BOOK_STATUS,
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
