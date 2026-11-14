import { Coords } from "@/types/location.types"

const EARTH_RADIUS_METERS = 6371000

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

/**
 * Distancia en línea recta entre dos puntos del planeta (fórmula de Haversine).
 * Se usa Haversine y no una resta de coordenadas porque la Tierra es una esfera:
 * un grado de longitud mide distinto según la latitud.
 * @param from : punto de origen
 * @param to : punto de destino
 * @returns distancia en metros
 */
export const getDistanceInMeters = (from: Coords, to: Coords): number => {
    const deltaLatitude = toRadians(to.latitude - from.latitude)
    const deltaLongitude = toRadians(to.longitude - from.longitude)

    const a =
        Math.sin(deltaLatitude / 2) ** 2 +
        Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(deltaLongitude / 2) ** 2

    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a))
}

/**
 * Pasa metros a un texto corto para mostrar en pantalla.
 * Menos de 1 km se redondea de a 10 m ("350 m"); desde 1 km se muestra con un decimal ("1,2 km").
 */
export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${Math.max(10, Math.round(meters / 10) * 10)} m`
    }
    return `${(meters / 1000).toFixed(1).replace('.', ',')} km`
}
