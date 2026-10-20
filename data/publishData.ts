/* Constantes que se usan al publicar un libro en Firebase */

/* Coleccion de Firestore: books/{bookId} */
export const BOOKS_COLLECTION = "books"

/* Carpetas de Cloud Storage: books/{bookId}/cover.jpg, books/{bookId}/chapters/0000.json y books/{bookId}/images/0000-0000.jpg */
export const STORAGE_BOOKS_FOLDER = "books"
export const STORAGE_CHAPTERS_FOLDER = "chapters"
export const STORAGE_IMAGES_FOLDER = "images"
export const STORAGE_COVER_FILE_NAME = "cover.jpg"

/* Los capitulos y las imagenes se numeran 0000, 0001... los ceros a la izquierda los dejan ordenados */
export const CHAPTER_FILE_DIGITS = 4

/* Cuantos capitulos se suben al mismo tiempo (para no mandar cientos de pedidos juntos) */
export const UPLOAD_BATCH_SIZE = 5

/* Todas las imagenes se publican en JPEG: portada e imagenes de capitulo */
export const JPEG_CONTENT_TYPE = "image/jpeg"
export const CHAPTER_CONTENT_TYPE = "application/json"

export const PUBLISH_MESSAGES = {
    DUPLICATE: "Ya publicaste un libro con ese título.",
}

/* Largo maximo de la sinopsis que se guarda (si el epub trae una mas larga se corta con "...") */
export const MAX_SYNOPSIS_LENGTH = 1000

/* Peso maximo de la portada ya achicada (en bytes) */
export const MAX_COVER_BYTES = 200 * 1024

/*
 * Intentos para achicar la portada, del mejor al mas liviano: se usa el primero que entre en
 * MAX_COVER_BYTES. Siempre sale en JPEG (WebP solo se puede guardar en Android).
 */
export const COVER_ATTEMPTS = [
    { width: 600, quality: 0.7 },
    { width: 600, quality: 0.5 },
    { width: 450, quality: 0.5 },
    { width: 300, quality: 0.4 },
]

/*
 * Peso maximo de una imagen de capitulo ya achicada (en bytes).
 * Es mas generoso que el de la portada: aca se prioriza la legibilidad.
 */
export const MAX_CHAPTER_IMAGE_BYTES = 300 * 1024

/*
 * Intentos para achicar una imagen de capitulo, del mejor al mas liviano.
 * Empiezan mas grandes que los de portada porque las imagenes de adentro
 * suelen traer detalles (mapas, ilustraciones) que no conviene perder.
 */
export const CHAPTER_IMAGE_ATTEMPTS = [
    { width: 1200, quality: 0.75 },
    { width: 1000, quality: 0.7 },
    { width: 800, quality: 0.6 },
    { width: 600, quality: 0.5 },
]

/*
 * Lista cerrada de categorias que el autor puede elegir al publicar.
 * Es cerrada a proposito: los epub casi nunca traen categorias reales y una lista
 * libre termina con "Fantasia", "fantasía", "Fantasía épica" y demas variantes del mismo tag.
 * Si mañana se agrega una categoria, se suma aca y listo.
 */
export const AVAILABLE_TAGS = [
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

export type BookTag = (typeof AVAILABLE_TAGS)[number]

/* Textos de la pantalla de publicacion (Publish) */
export const PUBLISH_LABELS = {
    SCREEN_TITLE: "Publicar libro",
    SECTION_TECHNICAL_SHEET: "FICHA TÉCNICA",
    FIELD_TITLE: "Título",
    FIELD_AUTHOR: "Autor",
    FIELD_SYNOPSIS: "Sinopsis",
    FIELD_TAGS: "Tags",
    SYNOPSIS_EMPTY: "Sin sinopsis",
    EDIT: "Editar",
    CANCEL: "Cancelar",
    SAVE: "Guardar",
    SYNOPSIS_PLACEHOLDER: "Contá de qué se trata tu libro...",
    STATS_CHAPTERS: "Capítulos",
    STATS_READING_TIME: "Lectura estimada",
    SECTION_ACCESS_TYPE: "TIPO DE ACCESO",
    ACCESS_FREE: "Gratis",
    ACCESS_FREE_DESC: "Todos los lectores",
    ACCESS_PREMIUM: "Solo Premium",
    ACCESS_PREMIUM_DESC: "Suscriptores activos",
    ACCESS_PAID: "Pago individual",
    ACCESS_PAID_DESC: "Precio por capítulo",
    SECTION_SCHEDULE: "PROGRAMAR PUBLICACIÓN",
    SECTION_NOTIFY: "NOTIFICAR SEGUIDORES",
    IN_DEVELOPMENT: "En Desarrollo",
    SCHEDULE_HINT: "El libro se publicará inmediatamente.",
    NOTIFY_HINT: "Tus seguidores no serán notificados.",
    PUBLISH_NOW: "Publicar ahora",
    PUBLISHING: "Publicando...",
    SUCCESS_TITLE: "¡Libro publicado!",
    SUCCESS_MESSAGE: "Tu libro ya está disponible en el catálogo.",
    DUPLICATE_TITLE: "Ya publicaste un libro con ese título.",
    BOOK_NOT_FOUND: "No encontramos este libro. Volvé a cargarlo desde el Editor.",
    BACK: "Volver",
    TAGS_HINT: "Elegí al menos una",
}