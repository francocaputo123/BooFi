import { BookStatus } from "@/types/catalog.types"

export const BOOKS_COLLECTION = "books"

/* Cuantos libros se bajan de una vez. El filtrado se hace en el celu, por eso hay un tope */
export const CATALOG_FETCH_LIMIT = 100

/* Del mockup: la grilla de "Todas las historias" tiene 3 columnas */
export const GRID_COLUMNS = 3
export const GRID_GAP = 12

/*
 * Generos disponibles para filtrar.
 * TODO: alinear con la lista de tags que use la pantalla de Publicar. El mockup muestra "Clásicos",
 * que hoy no esta en esta lista: hay que decidir con el equipo si se agrega o se cambia el mockup.
 */
export const BOOK_GENRES = [
    "Fantasía",
    "Ciencia Ficción",
    "Misterio",
    "Romance",
    "Aventura",
    "Terror",
    "Policial",
    "Drama",
    "Poesía",
    "Ensayo",
    "Biografía",
    "Historia",
    "Infantil",
    "Juvenil",
] as const

export const ALL_GENRES_LABEL = "Todos"

/*
 * Los libros que no traen "status" en Firestore se tratan como "en progreso":
 * es la suposicion menos enganosa para el lector (no promete que la historia esta terminada).
 */
export const DEFAULT_BOOK_STATUS: BookStatus = "ongoing"

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
    ongoing: "En progreso",
    completed: "Completa",
}

export const CATALOG_LABELS = {
    SCREEN_TITLE: "Explorar",
    SEARCH_PLACEHOLDER: "Buscar título o autor",
    SECTION_ALL: "Todas las historias",
    LOADING: "Cargando historias...",
    LOAD_ERROR: "No pudimos cargar las historias. Revisá tu conexión e intentá de nuevo.",
    RETRY: "Reintentar",
    REFRESH: "Actualizar",
    EMPTY_CATALOG: "Todavía no hay historias publicadas.",
    NO_RESULTS: "No se encontraron resultados.",
    CLEAR_FILTERS: "Limpiar filtros",
}
