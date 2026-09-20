import { View, Text, Pressable, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { useEpubUpload } from "../../hooks/useEpubUpload";
import { COLORS, SPACING, FONTSIZE } from "../../constants/theme";

const EditorScreen = () => {
    const { status, errorMessage, parsedBook, pickAndUploadEpub } = useEpubUpload();

    return (
        <View style={styles.container}>
            <Pressable style={styles.button} onPress={pickAndUploadEpub}>
                <Text style={styles.buttonText}>Cargar EPUB</Text>
            </Pressable>

        {status === "loading" && (
            <ActivityIndicator style={styles.spacingTop} color={COLORS.primary} />
        )}

        {status === "error" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {status === "success" && parsedBook && (
            <View style={styles.spacingTop}>
                <Text style={styles.successText}>
                ¡Libro cargado con éxito! Quedó disponible como borrador.
                </Text>
            <Text style={styles.bookTitle}>{parsedBook.title}</Text>
            <Text style={styles.bookAuthor}>{parsedBook.author}</Text>

            <FlatList
                data={parsedBook.chapters}
                keyExtractor={(chapter) => chapter.id}
                renderItem={({ item, index }) => (
                <Text style={styles.chapterItem}>
                    {index + 1}. {item.title}
                </Text>
                )}
            />
            </View>
        )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.l,
        justifyContent: "center",
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: FONTSIZE.m,
    },
    spacingTop: {
        marginTop: SPACING.l,
    },
    errorText: {
        color: "red",
        marginTop: SPACING.m,
    },
    successText: {
        color: COLORS.accent,
        marginBottom: SPACING.s,
    },
    bookTitle: {
        fontSize: FONTSIZE.l,
        fontWeight: "bold",
        color: COLORS.text,
    },
    bookAuthor: {
        fontSize: FONTSIZE.m,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
    },
    chapterItem: {
        fontSize: FONTSIZE.s,
        color: COLORS.text,
        paddingVertical: SPACING.xs,
    },
});

export default EditorScreen;