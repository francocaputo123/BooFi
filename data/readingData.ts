export const READ_BUTTON_LABELS = {
    START: "Comenzar a leer",
    CONTINUE: "Continuar leyendo",
}

export const READER_LABELS = {
    PREVIOUS_CHAPTER: "Anterior",
    NEXT_CHAPTER: "Siguiente",
    OPEN_CHAPTER_LIST: "Ver capítulos",
    CHAPTER_LIST_TITLE: "Capítulos",
    CLOSE: "Cerrar",
    LOADING_PROGRESS: "Cargando tu progreso...",
    BOOK_NOT_FOUND: "No encontramos este libro. Volvé a cargarlo desde el Editor.",
    BACK: "Volver",
    LOADING_BOOK: "Cargando libro...",
    PUBLISHED_BOOK_NOT_FOUND: "Este libro ya no está disponible.",
    LOADING_CHAPTER: "Cargando capítulo...",
    CHAPTER_LOAD_ERROR: "No se pudo cargar el capítulo. Revisá tu conexión e intentá de nuevo.",
    RETRY: "Reintentar",
}

// Subcolección de users/{uid} donde se guarda el progreso de lectura en la nube (un documento por libro)
export const READING_PROGRESS_COLLECTION = "readingProgress"

// Si la nube no responde en este tiempo, se sigue con lo guardado en el dispositivo
export const REMOTE_SYNC_TIMEOUT_MS = 6000

// Mientras se scrollea dentro del mismo capítulo, se espera este tiempo antes de escribir en Firestore
export const REMOTE_SAVE_DELAY_MS = 3000

// Tamaño de letra por nivel de titulo (h1 a h6) del epub
export const HEADING_FONT_SIZES: Record<number, number> = {
    1: 28,
    2: 24,
    3: 21,
    4: 19,
    5: 17,
    6: 16,
}