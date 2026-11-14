import { Coords } from "@/types/location.types"
import { Library, LibraryKind } from "@/types/library.types"
import { getDistanceInMeters } from "@/utils/distance"
import { withTimeout } from "@/utils/withTimeout"
import {
    LIBRARY_FETCH_TIMEOUT_MS,
    LIBRARY_KIND_LABELS,
    LIBRARY_SEARCH_RADIUS_METERS,
    OVERPASS_ENDPOINTS,
    OVERPASS_USER_AGENT,
} from "@/data/libraryData"

// Forma de lo que devuelve Overpass. Los nodos traen lat/lon;
// las ways y relations (edificios) traen un punto "center" en su lugar.
type OverpassElement = {
    type: 'node' | 'way' | 'relation'
    id: number
    lat?: number
    lon?: number
    center?: { lat: number; lon: number }
    tags?: Record<string, string>
}

/*
 * Pide bibliotecas (amenity=library) y librerías (shop=books) dentro del radio.
 * "nwr" busca en nodes, ways y relations: muchas librerías están cargadas como edificio y no como punto.
 * "out center tags" devuelve un punto por cada resultado más sus etiquetas (nombre, dirección).
 */
const buildQuery = ({ latitude, longitude }: Coords): string =>
    `[out:json][timeout:15];(` +
    `nwr["amenity"="library"](around:${LIBRARY_SEARCH_RADIUS_METERS},${latitude},${longitude});` +
    `nwr["shop"="books"](around:${LIBRARY_SEARCH_RADIUS_METERS},${latitude},${longitude});` +
    `);out center tags;`

const requestOverpass = async (endpoint: string, query: string): Promise<OverpassElement[]> => {
    // GET con la consulta en la URL: es la forma más simple y documentada de usar Overpass
    const response = await withTimeout(
        fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': OVERPASS_USER_AGENT,
            },
        }),
        LIBRARY_FETCH_TIMEOUT_MS
    )

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    // Se lee como texto y después se convierte: si el servidor devuelve una página de error (HTML)
    // el mensaje dice eso, en vez del críptico "JSON Parse error"
    const text = await response.text()
    let json: { elements?: OverpassElement[]; remark?: string }
    try {
        json = JSON.parse(text)
    } catch {
        throw new Error(`respuesta no válida (${text.slice(0, 60).replace(/\s+/g, ' ')})`)
    }

    // Overpass a veces responde 200 pero avisa en "remark" que la consulta falló (ej: sobrecarga)
    if (json.remark && !Array.isArray(json.elements)) {
        throw new Error(json.remark.slice(0, 80))
    }
    return Array.isArray(json.elements) ? json.elements : []
}

/*
 * Convierte un elemento de OpenStreetMap en una Library.
 * Se valida todo porque los datos son cargados por voluntarios y pueden venir incompletos.
 */
const mapElement = (element: OverpassElement, userCoords: Coords): Library | null => {
    const latitude = element.lat ?? element.center?.lat
    const longitude = element.lon ?? element.center?.lon

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return null
    }

    const tags = element.tags ?? {}
    const kind: LibraryKind = tags.amenity === 'library' ? 'library' : 'bookstore'

    const street = tags['addr:street']
    const number = tags['addr:housenumber']
    const address = street ? (number ? `${street} ${number}` : street) : null

    return {
        id: `${element.type}-${element.id}`,
        // Si el lugar no tiene nombre cargado se muestra el tipo, para que igual aparezca en la lista
        name: tags.name ?? tags['name:es'] ?? LIBRARY_KIND_LABELS[kind],
        kind,
        address,
        latitude,
        longitude,
        distanceMeters: getDistanceInMeters(userCoords, { latitude, longitude }),
    }
}

/**
 * Busca las bibliotecas y librerías reales cerca de una posición.
 * Prueba con cada servidor de Overpass en orden y se queda con el primero que responda.
 * @param userCoords : posición del usuario
 * @returns Library[] : ordenadas de la más cercana a la más lejana
 */
export const fetchNearbyLibraries = async (userCoords: Coords): Promise<Library[]> => {
    const query = buildQuery(userCoords)
    // Se junta el motivo de cada servidor que falla, para poder ver qué pasó en realidad
    const failures: string[] = []

    for (const endpoint of OVERPASS_ENDPOINTS) {
        try {
            const elements = await requestOverpass(endpoint, query)

            return elements
                .map((element) => mapElement(element, userCoords))
                .filter((library): library is Library => library !== null)
                .sort((a, b) => a.distanceMeters - b.distanceMeters)
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error)
            const host = endpoint.replace('https://', '').split('/')[0]
            failures.push(`${host}: ${reason}`)
            console.warn(`[libraryService] falló ${host}: ${reason}`)
        }
    }

    throw new Error(failures.join(' | '))
}
