import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { Coords, LocationStatus } from '../types/location.types';


export function useUserLocation() {
    const [status, setStatus] = useState<LocationStatus>('loading');
    const [coords, setCoords] = useState<Coords | null>(null);
    const [city, setCity] = useState<string | null>(null);

    const load = useCallback(async () => {
        setStatus('loading');
        try {
        // 1) Pedimos permiso
            const { status: permission } =
                await Location.requestForegroundPermissionsAsync();

            if (permission !== 'granted') {
                setStatus('denied');
            return;
            }

      // 2) Traemos la posicion y mostramos el mapa ya mismo
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const current = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
            setCoords(current);
            setStatus('granted');

            // 3) Aparte, buscamos el nombre de la ciudad.
            // Si esto falla no pasa nada, el mapa ya funciona asi que yo tranquilo y vos nervioso.
            try {
                const [place] = await Location.reverseGeocodeAsync(current);
                setCity(place?.city ?? place?.subregion ?? place?.region ?? null);
            }   catch {
                setCity(null);
            }
        }   catch {
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return { status, coords, city, retry: load };
}