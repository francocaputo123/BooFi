import { Pressable, StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { COLORS, FONTSIZE, SPACING } from '@/constants/theme'
import { LIBRARY_KIND_LABELS } from '@/data/libraryData'
import { Library } from '@/types/library.types'
import { formatDistance } from '@/utils/distance'

type LibraryCardProps = {
    library: Library
    selected: boolean
    onPress: () => void
}

const LibraryCard = ({ library, selected, onPress }: LibraryCardProps) => {
    // Si no hay dirección cargada se muestra el tipo (Biblioteca / Librería)
    const subtitle = library.address ?? LIBRARY_KIND_LABELS[library.kind]

    return (
        <Pressable onPress={onPress} style={[styles.card, selected && styles.cardSelected]}>
            <View style={styles.iconBox}>
                <Ionicons
                    name={library.kind === 'library' ? 'library-outline' : 'book-outline'}
                    size={22}
                    color={COLORS.primary}
                />
            </View>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{library.name}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
            </View>
            <Text style={styles.distance}>{formatDistance(library.distanceMeters)}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s + SPACING.xs,
        padding: SPACING.s + SPACING.xs,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardSelected: { borderColor: COLORS.accent, borderWidth: 2 },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    info: { flex: 1 },
    name: { color: COLORS.text, fontSize: FONTSIZE.m, fontWeight: '600' },
    subtitle: { color: COLORS.textSecondary, fontSize: FONTSIZE.xs, marginTop: 2 },
    distance: { color: COLORS.primary, fontSize: FONTSIZE.s, fontWeight: '700' },
})

export default LibraryCard
