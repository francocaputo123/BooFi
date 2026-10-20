/* "ongoing" = en progreso, "completed" = completa. Los textos para mostrar estan en BOOK_STATUS_LABELS */
export type BookStatus = "ongoing" | "completed"

/*
 * Lo minimo de un libro que necesita el listado de Explorar.
 * NOTE: los generos se guardan en Firestore como "tags" (array de strings), por eso se llaman asi aca tambien.
 */
export interface CatalogBook {
    id: string
    title: string
    authorName: string
    coverUrl: string | null
    tags: string[]
    status: BookStatus
}

/* Lo que elige el usuario en Explorar. genre null = "Todos" */
export interface CatalogFilters {
    searchText: string
    genre: string | null
}
