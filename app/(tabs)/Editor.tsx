import { useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, Href } from "expo-router";
import { useEpubUpload } from "../../utils/useEpubUpload";
import bookStore from "../../store/bookStore";
import { useLatestDraft } from "../../hooks/useLatestDraft";import { useCreateDraft } from "../../hooks/useCreateDraft";
import LatestDraftCard from "../../components/LatestDraftCard";
import ToolCard from "../../components/ToolCard";
import { prepareCover } from "../../utils/prepareCover";
import { COLORS, SPACING, FONTSIZE } from "../../constants/theme";

const EditorScreen = () => {
  const { status, errorMessage, parsedBook, pickAndUploadEpub } = useEpubUpload();
  const router = useRouter();
  const saveBook = bookStore((state) => state.saveBook);
  const { latestDraft, chapterCount, isLoading: isLoadingDraft, errorMessage: draftError } = useLatestDraft();

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.overline}>ESPACIO DE AUTOR</Text>
      <Text style={styles.heading}>Editor</Text>

      {isLoadingDraft && <ActivityIndicator style={styles.spacingTop} color={COLORS.primary} />}

      {latestDraft && (
        <LatestDraftCard
          draft={latestDraft}
          chapterCount={chapterCount}
          onPress={() =>
            router.push({ pathname: "/write/[draftId]", params: { draftId: latestDraft.id } })
          }
        />
      )}

      <Text style={styles.sectionTitle}>HERRAMIENTAS</Text>

      <ToolCard
        icon="library-outline"
        title="Mis historias"
        subtitle="Publicadas y borradores"
        onPress={() => router.push("/write" as Href)}
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <ToolCard
            icon="add"
            title="Nueva historia"
            subtitle="Empezá desde cero"
            onPress={() => router.push("/write/new" as Href)}
          />
        </View>
        <View style={styles.half}>
          <ToolCard
            icon="cloud-upload-outline"
            title="Cargar EPUB"
            subtitle="Importá tu manuscrito"
            onPress={pickAndUploadEpub}
          />
        </View>
      </View>

      {status === "loading" && (
        <ActivityIndicator style={styles.spacingTop} color={COLORS.primary} />
      )}

      {status === "error" && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      {draftError && <Text style={styles.errorText}>{draftError}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.l,
    gap: SPACING.m,
  },
  overline: {
    fontSize: FONTSIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  heading: {
    fontSize: FONTSIZE.xl,
    fontWeight: "bold",
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: FONTSIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: SPACING.m,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  half: {
    flex: 1,
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