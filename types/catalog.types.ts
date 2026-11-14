import { BookVisibility } from "@/types/book.types"

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
    /* "paid" = libro de pago. Si no esta en Firestore se asume "public" (gratis) */
    visibility: BookVisibility
    /* Precio en pesos argentinos (entero). null si el libro es gratis o no trae precio */
    price: number | null
    /* Cantidad de capitulos: hace falta para calcular el % de lectura en el Home. 0 si el libro no trae la lista */
    chapterCount: number
}

/* Lo que elige el usuario en Explorar. genre null = "Todos" */
export interface CatalogFilters {
    searchText: string
    genre: string | null
    /* true = solo libros de pago (boton Tienda del Home) */
    onlyPaid: boolean
}
