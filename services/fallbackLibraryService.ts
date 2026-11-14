import * as Location from "expo-location"
import { Coords } from "@/types/location.types"
import { Library } from "@/types/library.types"
import { getDistanceInMeters } from "@/utils/distance"
import {
    FALLBACK_GEOCODE_CONCURRENCY,
    FALLBACK_LIBRARIES,
    FALLBACK_MAX_DISTANCE_METERS,
    FALLBACK_REFERENCE_POINT,
    FallbackLibrary,
} from "@/data/fallbackLibraries"

// Coordenadas ya resueltas en esta sesión: si el usuario reintenta no se vuelve a geocodificar.
// Solo se guarda cuando el geocodificador respondió (aunque no haya encontrado nada); si dio error no.
const resolvedCoords = new Map<string, Coords | null>()

/*
 * Busca las coordenadas de una librería de la lista.
 * Si la entrada ya trae latitude/longitude se usan esas; si no, se geocodifica la dirección.
 * Devuelve null si no se pudo ubicar, así esa librería simplemente no aparece.
 */
const locate = async (entry: FallbackLibrary): Promise<Coords | null> => {
    if (entry.latitude !== undefined && entry.longitude !== undefined) {
        return { latitude: entry.latitude, longitude: entry.longitude }
    }

    if (resolvedCoords.has(entry.id)) {
        return resolvedCoords.get(entry.id) ?? null
    }

    try {
        const results = await Location.geocodeAsync(`${entry.address}, ${entry.locality}, Buenos Aires, Argentina`)
        const first = results[0]
        const coords: Coords | null = first ? { latitude: first.latitude, longitude: first.longitude } : null

        // Filtro de seguridad: una dirección que cae muy lejos de la zona es un resultado equivocado
        const isNearReference = coords !== null && getDistanceInMeters(FALLBACK_REFERENCE_POINT, coords) <= FALLBACK_MAX_DISTANCE_METERS
        const validCoords = isNearReference ? coords : null

        resolvedCoords.set(entry.id, validCoords)
        return validCoords
    } catch {
        console.warn(`[fallbackLibraryService] no se pudo geocodificar: ${entry.name}`)
        return null
    }
}

// Ejecuta una tarea por cada elemento, pero con un máximo de "limit" tareas a la vez
const mapWithConcurrency = async <T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> => {
    const results: R[] = new Array(items.length)
    let nextIndex = 0

    const worker = async () => {
        while (nextIndex < items.length) {
            const index = nextIndex++
            results[index] = await task(items[index])
        }
    }

    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
    return results
}

/**
 * Lista de respaldo: librerías guardadas en la app, para cuando falla la consulta a OpenStreetMap.
 * Las direcciones se convierten en coordenadas con el geocodificador del propio celular.
 * @param userCoords : posición del usuario (para calcular la distancia a cada librería)
 * @returns Library[] : ordenadas de la más cercana a la más lejana; vacía si no se pudo ubicar ninguna
 */
export const getFallbackLibraries = async (userCoords: Coords): Promise<Library[]> => {
    const located = await mapWithConcurrency(FALLBACK_LIBRARIES, FALLBACK_GEOCODE_CONCURRENCY, async (entry) => ({
        entry,
        coords: await locate(entry),
    }))

    return located
        .filter((item): item is { entry: FallbackLibrary; coords: Coords } => item.coords !== null)
        .map(({ entry, coords }): Library => ({
            id: `fallback-${entry.id}`,
            name: entry.name,
            kind: 'bookstore',
            address: `${entry.address}, ${entry.locality}`,
            latitude: coords.latitude,
            longitude: coords.longitude,
            distanceMeters: getDistanceInMeters(userCoords, coords),
        }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
}
