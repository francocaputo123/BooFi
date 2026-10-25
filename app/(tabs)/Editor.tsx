import { useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEpubUpload } from "../../utils/useEpubUpload";
import bookStore from "../../store/bookStore";
import DraftList from "../../components/DraftList"
import { prepareCover } from "../../utils/prepareCover";
import { COLORS, SPACING, FONTSIZE } from "../../constants/theme";

const EditorScreen = () => {
  const { status, errorMessage, parsedBook, pickAndUploadEpub } = useEpubUpload();
  const router = useRouter();
  const saveBook = bookStore((state) => state.saveBook);

  useEffect(() => {
    if (status === "success" && parsedBook) {
      // El libro va al store y solo viaja el id: los capítulos completos son demasiado pesados para la URL
      saveBook(parsedBook);
      // TEMPORAL (prueba del Paso 3.2): se saca en el Paso 4
      prepareCover(parsedBook.coverUri).then((cover) => {
        console.log("Portada achicada:", cover ? Math.round((cover.length * 3) / 4 / 1024) + " KB" : "sin portada");
      });
      router.push({
        pathname: "/books/Details",
        params: { id: parsedBook.id },
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
      <DraftList />
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