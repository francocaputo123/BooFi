import { useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from 'react-native-maps';
import { useUserLocation } from '../../utils/useUserLocation';
import { COLORS } from '../../constants/theme';

// Chips de filtro (por ahora solo se marcan; el filtrado real va en el 9.2)
const FILTERS = ['Todos', '< 1 km', '< 3 km', '< 5 km', 'Abiertas'];

// Botón simple con el estilo de la app
function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
    );
}

export default function MapScreen() {
    const { status, coords, city, retry } = useUserLocation();
    const [selectedFilter, setSelectedFilter] = useState('Todos');

    // Lo que se muestra dentro del recuadro del mapa según el estado
    const renderMap = () => {
        if (status === 'loading') {
            return (
            <View style={styles.mapMessage}>
                <ActivityIndicator color={COLORS.accent} />
                <Text style={styles.mapMessageText}>Buscando tu ubicación...</Text>
            </View>
        );
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
        );
    }

    if (status === 'error' || !coords) {
        return (
            <View style={styles.mapMessage}>
                <Text style={styles.mapMessageText}>No pudimos obtener tu ubicación.</Text>
                <ActionButton label="Reintentar" onPress={retry} />
            </View>
        );
    }

    // Todo bien: mapa centrado en el usuario
    return (
        <MapView
            style={StyleSheet.absoluteFill}
            showsUserLocation
            initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }}
        />
        );
    };

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

        {/* Filtros */}
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
        >
        {FILTERS.map((filter) => {
            const selected = filter === selectedFilter;
            return (
                <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[styles.chip, selected && styles.chipSelected]}
                >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {filter}
                    </Text>
                </Pressable>
            );
            })}
        </ScrollView>

        {/* Lista de librerías (se llena en el ticket 9.2) */}
        <View style={styles.listHeader}>
            <Text style={styles.sectionLabel}>LIBRERÍAS CERCANAS</Text>
            <Text style={styles.count}>0 resultados</Text>
        </View>
        <View style={styles.empty}>
            <Text style={styles.emptyText}>Todavía no hay librerías para mostrar.</Text>
            </View>
        </SafeAreaView>
    );
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
    },
    sectionLabel: { color: COLORS.textSecondary, fontSize: 11, letterSpacing: 1 },
    count: { color: COLORS.textSecondary, fontSize: 11 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});