import { useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView, { Marker } from 'react-native-maps'
import { useUserLocation } from '@/utils/useUserLocation'
import { useNearbyLibraries } from '@/hooks/useNearbyLibraries'
import LibraryCard from '@/components/LibraryCard'
import { COLORS } from '@/constants/theme'
import { DEFAULT_MAP_FILTER_ID, LIBRARY_LABELS, MAP_FILTERS } from '@/data/libraryData'
import { Library } from '@/types/library.types'

// Zoom al tocar una librería (cuanto más chico el número, más cerca)
const FOCUS_DELTA = 0.01

// Botón simple con el estilo de la app
const ActionButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
)

const MapScreen = () => {
    const { status, coords, city, retry } = useUserLocation()
    const { libraries, isLoading, isFallback, errorMessage, errorDetail, retry: retryLibraries } = useNearbyLibraries(coords)
    const [selectedFilterId, setSelectedFilterId] = useState(DEFAULT_MAP_FILTER_ID)
    const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null)
    const mapRef = useRef<MapView>(null)

    // La lista y los pines usan siempre la misma lista filtrada, así nunca se desincronizan.
    // Las librerías ya vienen ordenadas por cercanía desde el servicio.
    const visibleLibraries = useMemo(() => {
        const maxMeters = MAP_FILTERS.find((filter) => filter.id === selectedFilterId)?.maxMeters ?? null
        if (maxMeters === null) {
            return libraries
        }
        return libraries.filter((library) => library.distanceMeters <= maxMeters)
    }, [libraries, selectedFilterId])

    // Marca la librería y centra el mapa en ella
    const handleSelectLibrary = (library: Library) => {
        setSelectedLibraryId(library.id)
        mapRef.current?.animateToRegion(
            {
                latitude: library.latitude,
                longitude: library.longitude,
                latitudeDelta: FOCUS_DELTA,
                longitudeDelta: FOCUS_DELTA,
            },
            500
        )
    }

    // Lo que se muestra dentro del recuadro del mapa según el estado
    const renderMap = () => {
        if (status === 'loading') {
            return (
                <View style={styles.mapMessage}>
                    <ActivityIndicator color={COLORS.accent} />
                    <Text style={styles.mapMessageText}>Buscando tu ubicación...</Text>
                </View>
            )
        }

        if (status === 'denied') {
            return (
                <View style={styles.mapMessage}>
                    <Text style={styles.mapMessageText}>
                        Necesitamos tu permiso de ubicación para mostrarte en el mapa.
                    </Text>
                    <ActionButton label="Abrir ajustes" onPress={() => Linking.openSettings()} />
                    <ActionButton label="Reintentar" onPress={retry} />
                </View>
            )
        }

        if (status === 'error' || !coords) {
            return (
                <View style={styles.mapMessage}>
                    <Text style={styles.mapMessageText}>No pudimos obtener tu ubicación.</Text>
                    <ActionButton label="Reintentar" onPress={retry} />
                </View>
            )
        }

        // Todo bien: mapa centrado en el usuario, con un pin por cada librería visible
        return (
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                showsUserLocation
                initialRegion={{
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
            >
                {visibleLibraries.map((library) => (
                    <Marker
                        key={library.id}
                        coordinate={{ latitude: library.latitude, longitude: library.longitude }}
                        title={library.name}
                        description={library.address ?? undefined}
                        pinColor={library.id === selectedLibraryId ? COLORS.accent : COLORS.primary}
                        onPress={() => setSelectedLibraryId(library.id)}
                    />
                ))}
            </MapView>
        )
    }

    // Mensaje que ocupa el lugar de la lista cuando no hay nada para listar
    const renderListEmpty = () => {
        if (status !== 'granted') {
            return <Text style={styles.emptyText}>{LIBRARY_LABELS.NO_LOCATION}</Text>
        }

        if (isLoading) {
            return (
                <View style={styles.emptyBox}>
                    <ActivityIndicator color={COLORS.accent} />
                    <Text style={styles.emptyText}>{LIBRARY_LABELS.SEARCHING}</Text>
                </View>
            )
        }

        if (errorMessage) {
            return (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>{errorMessage}</Text>
                    {errorDetail && <Text style={styles.errorDetail}>{errorDetail}</Text>}
                    <ActionButton label={LIBRARY_LABELS.RETRY} onPress={retryLibraries} />
                </View>
            )
        }

        // Hay librerías pero el filtro de distancia las dejó afuera, o directamente no hay ninguna
        return (
            <Text style={styles.emptyText}>
                {libraries.length > 0 ? LIBRARY_LABELS.EMPTY_FILTERED : LIBRARY_LABELS.EMPTY_ALL}
            </Text>
        )
    }

    const resultsText = isLoading
        ? 'Buscando...'
        : `${visibleLibraries.length} ${visibleLibraries.length === 1 ? 'resultado' : 'resultados'}`

    return (
        <SafeAreaView style={styles.screen} edges={['top']}>
            {/* Encabezado: título + ciudad */}
            <View style={styles.header}>
                <Text style={styles.title}>Mapa</Text>
                <View style={styles.cityPill}>
                    <View style={styles.cityDot} />
                    <Text style={styles.cityText}>{city ?? 'Tu ubicación'}</Text>
                </View>
            </View>

            {/* Mapa */}
            <View style={styles.mapBox}>{renderMap()}</View>

            {/* Filtros por distancia */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
                contentContainerStyle={styles.chipsContent}
            >
                {MAP_FILTERS.map((filter) => {
                    const selected = filter.id === selectedFilterId
                    return (
                        <Pressable
                            key={filter.id}
                            onPress={() => setSelectedFilterId(filter.id)}
                            style={[styles.chip, selected && styles.chipSelected]}
                        >
                            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                                {filter.label}
                            </Text>
                        </Pressable>
                    )
                })}
            </ScrollView>

            {/* Lista de librerías cercanas, de la más cerca a la más lejos */}
            <View style={styles.listHeader}>
                <Text style={styles.sectionLabel}>{LIBRARY_LABELS.SECTION_TITLE}</Text>
                <Text style={styles.count}>{resultsText}</Text>
            </View>
            {/* Aviso: la lista que se ve es la guardada en la app, no la de OpenStreetMap */}
            {isFallback && (
                <View style={styles.fallbackNotice}>
                    <Text style={styles.fallbackText}>{LIBRARY_LABELS.FALLBACK_NOTICE}</Text>
                    <Pressable onPress={retryLibraries}>
                        <Text style={styles.fallbackRetry}>{LIBRARY_LABELS.RETRY}</Text>
                    </Pressable>
                </View>
            )}
            <FlatList
                data={visibleLibraries}
                keyExtractor={(library) => library.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                    <LibraryCard
                        library={item}
                        selected={item.id === selectedLibraryId}
                        onPress={() => handleSelectLibrary(item)}
                    />
                )}
                ListEmptyComponent={renderListEmpty}
                // NOTE: OpenStreetMap pide mostrar de dónde salen los datos (licencia ODbL)
                ListFooterComponent={
                    visibleLibraries.length > 0 && !isFallback ? (
                        <Text style={styles.attribution}>{LIBRARY_LABELS.ATTRIBUTION}</Text>
                    ) : null
                }
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: { color: COLORS.text, fontSize: 22, fontWeight: '700' },
    cityPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
    cityText: { color: COLORS.textSecondary, fontSize: 13 },

    mapBox: {
        height: 230,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    mapMessage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 10,
    },
    mapMessageText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 14 },

    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buttonText: { color: COLORS.background, fontWeight: '600' },

    chipsScroll: { flexGrow: 0, marginTop: 14 },
    chipsContent: { paddingHorizontal: 16, gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: COLORS.textSecondary, fontSize: 13 },
    chipTextSelected: { color: COLORS.background, fontWeight: '600' },

    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 18,
        marginBottom: 8,
    },
    sectionLabel: { color: COLORS.textSecondary, fontSize: 11, letterSpacing: 1 },
    count: { color: COLORS.textSecondary, fontSize: 11 },

    list: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 },
    separator: { height: 8 },

    emptyBox: { alignItems: 'center', gap: 10 },
    emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 16 },
    fallbackNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    fallbackText: { flex: 1, color: COLORS.textSecondary, fontSize: 11 },
    fallbackRetry: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
    errorDetail: { color: COLORS.textSecondary, fontSize: 10, textAlign: 'center', opacity: 0.7 },
    attribution: { color: COLORS.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 12 },
})

export default MapScreen
