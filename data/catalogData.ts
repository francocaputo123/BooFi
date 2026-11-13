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

/* Cuantos libros se muestran en la lista del Home (el catalogo viene ordenado del mas nuevo al mas viejo) */
export const HOME_BOOKS_LIMIT = 10

/* Cuantos libros se muestran como maximo en "Seguir leyendo" */
export const HOME_CONTINUE_LIMIT = 10

/* Ancho de cada tarjeta en la lista horizontal del Home */
export const HOME_CARD_WIDTH = 110

/* Cartelito que se muestra sobre la portada de los libros de pago */
export const PAID_BADGE_LABEL = "Pago"

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
    HOME_SECTION_LATEST: "ÚLTIMAS PUBLICACIONES",
    HOME_SECTION_CONTINUE: "SEGUIR LEYENDO",
    FILTER_ONLY_PAID: "Solo de pago",
    HOME_EMPTY: "Todavía no hay historias publicadas.",
}
