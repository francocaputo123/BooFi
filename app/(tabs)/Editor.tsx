import { useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEpubUpload } from "../../utils/useEpubUpload";
import { COLORS, SPACING, FONTSIZE } from "../../constants/theme";

const EditorScreen = () => {
  const { status, errorMessage, parsedBook, pickAndUploadEpub } = useEpubUpload();
  const router = useRouter();

  useEffect(() => {
    if (status === "success" && parsedBook) {
      router.push({
        pathname: "/books/Details",
        params: {
          id: "1",
          title: parsedBook.title,
          author: parsedBook.author,
          chapters: JSON.stringify(parsedBook.chapters),
        },
      });
    }
  }, [status, parsedBook]);

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
});

export default EditorScreen;