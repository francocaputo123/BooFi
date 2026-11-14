import { LibraryKind } from "@/types/library.types"

export type MapFilter = {
    id: string
    label: string
    // null = sin límite de distancia
    maxMeters: number | null
}

// El filtro "Todos" va primero porque es el que arranca seleccionado
export const MAP_FILTERS: MapFilter[] = [
    { id: 'all', label: 'Todos', maxMeters: null },
    { id: '1km', label: '< 1 km', maxMeters: 1000 },
    { id: '3km', label: '< 3 km', maxMeters: 3000 },
    { id: '5km', label: '< 5 km', maxMeters: 5000 },
]

export const DEFAULT_MAP_FILTER_ID = 'all'

// Radio de búsqueda en OpenStreetMap (20 km). Tiene que ser mayor al filtro más grande (5 km),
// si no, "Todos" mostraría lo mismo que "< 5 km".
export const LIBRARY_SEARCH_RADIUS_METERS = 20000

// Tiempo máximo de espera por cada servidor antes de probar con el siguiente
export const LIBRARY_FETCH_TIMEOUT_MS = 8000

// Servidores públicos de Overpass (la API de consultas de OpenStreetMap, gratis y sin API key).
// Si uno está caído o saturado se prueba con el siguiente.
export const OVERPASS_ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

// Overpass pide que cada app se identifique; los pedidos anónimos suelen ser rechazados (406 / 429)
export const OVERPASS_USER_AGENT = 'BooFi/1.0 (app universitaria - UNPi)'

export const LIBRARY_KIND_LABELS: Record<LibraryKind, string> = {
    library: 'Biblioteca',
    bookstore: 'Librería',
}

export const LIBRARY_LABELS = {
    SECTION_TITLE: 'LIBRERÍAS CERCANAS',
    SEARCHING: 'Buscando librerías cercanas...',
    NO_LOCATION: 'Activá tu ubicación para ver las librerías cercanas.',
    FETCH_ERROR: 'No pudimos cargar las librerías. Revisá tu conexión e intentá de nuevo.',
    EMPTY_ALL: 'No encontramos librerías cerca tuyo.',
    EMPTY_FILTERED: 'No hay librerías dentro de esa distancia. Probá con un rango mayor.',
    RETRY: 'Reintentar',
    ATTRIBUTION: 'Datos de OpenStreetMap',
    FALLBACK_NOTICE: 'Mostrando librerías guardadas: no pudimos conectar con el servidor de mapas.',
}
