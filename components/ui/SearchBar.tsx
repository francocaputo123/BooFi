import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

interface SearchBarProps {
    value: string
    onChangeText: (text: string) => void
    placeholder: string
}

/**
 * Campo de busqueda con lupa y boton para borrar. No guarda el texto: lo maneja el componente padre.
 */
const SearchBar = ({ value, onChangeText, placeholder }: SearchBarProps) => {
    return (
        <View style={styles.container}>
            <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
            {value.length > 0 && (
                <Pressable onPress={() => onChangeText("")} accessibilityLabel="Borrar búsqueda" hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.s,
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s + 4,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: FONTSIZE.m,
        padding: 0,
    },
})

export default SearchBar
