import { useCallback, useEffect, useRef, useState } from 'react'
import { Coords } from '@/types/location.types'
import { Library } from '@/types/library.types'
import { fetchNearbyLibraries } from '@/services/libraryService'
import { getFallbackLibraries } from '@/services/fallbackLibraryService'
import { LIBRARY_LABELS } from '@/data/libraryData'

/**
 * Trae las librerías cercanas a la posición del usuario.
 * Primero consulta OpenStreetMap; si esa consulta falla, usa la lista guardada en la app.
 * Espera a que haya coordenadas (coords = null mientras se busca la ubicación).
 * @param coords : posición del usuario
 */
export const useNearbyLibraries = (coords: Coords | null) => {
    const [libraries, setLibraries] = useState<Library[]>([])
    const [isLoading, setIsLoading] = useState(false)
    // true cuando la lista que se ve es la guardada en la app y no la de OpenStreetMap
    const [isFallback, setIsFallback] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    // Motivo técnico del fallo (qué servidor falló y por qué), para mostrarlo chico en pantalla
    const [errorDetail, setErrorDetail] = useState<string | null>(null)

    // Se depende de los números y no del objeto coords para no volver a pedir si cambia solo la referencia
    const latitude = coords?.latitude
    const longitude = coords?.longitude

    // Si el usuario reintenta mientras hay un pedido en curso, solo vale el último
    const lastRequestId = useRef(0)

    const load = useCallback(async () => {
        if (latitude === undefined || longitude === undefined) {
            return
        }

        const userCoords = { latitude, longitude }
        const requestId = ++lastRequestId.current
        setIsLoading(true)
        setIsFallback(false)
        setErrorMessage(null)
        setErrorDetail(null)

        try {
            const result = await fetchNearbyLibraries(userCoords)
            if (requestId === lastRequestId.current) {
                setLibraries(result)
            }
        } catch (error) {
            if (requestId !== lastRequestId.current) {
                return
            }

            // La API falló: se prueba con la lista propia
            const fallbackLibraries = await getFallbackLibraries(userCoords)
            if (requestId !== lastRequestId.current) {
                return
            }

            if (fallbackLibraries.length > 0) {
                setLibraries(fallbackLibraries)
                setIsFallback(true)
            } else {
                setLibraries([])
                setErrorMessage(LIBRARY_LABELS.FETCH_ERROR)
                setErrorDetail(error instanceof Error ? error.message : String(error))
            }
        } finally {
            if (requestId === lastRequestId.current) {
                setIsLoading(false)
            }
        }
    }, [latitude, longitude])

    useEffect(() => {
        load()
    }, [load])

    return { libraries, isLoading, isFallback, errorMessage, errorDetail, retry: load }
}
