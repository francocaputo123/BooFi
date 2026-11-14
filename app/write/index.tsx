import { useState } from "react"
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet } from "react-native"
import { Stack, useRouter } from "expo-router"
import { useMyStories } from "@/hooks/useMyStories"
import StoryTabs, { StoryTab } from "@/components/StoryTabs"
import StoryCard from "@/components/StoryCard"
import { STATUS_LABELS } from "@/constants/draftOptions"
import { Draft } from "@/types/draft.types"
import { CatalogBook } from "@/types/catalog.types"
import { getDraftTitle } from "@/utils/getDraftTitle"
import { formatPrice } from "@/utils/formatPrice"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import HeaderAddButton from "@/components/HeaderAddButton"

type StoryTabKey = "published" | "drafts"

/**
 * Detalle de un libro publicado: cantidad de capítulos y si es gratis o de pago.
 * @param CatalogBook book : libro publicado
 * @returns string : ej "8 capítulos · Gratis"
 */
const getPublishedMeta = (book: CatalogBook): string => {
  const chapters = `${book.chapterCount} ${book.chapterCount === 1 ? "capítulo" : "capítulos"}`
  const price = book.visibility === "paid" && book.price ? formatPrice(book.price) : "Gratis"
  return `${chapters} · ${price}`
}

/**
 * Historias del autor, separadas en publicadas y borradores sin publicar.
 * TODO: mostrar ventas o lecturas de cada historia publicada cuando se decida qué métrica mostrar
 */
const MyStoriesScreen = () => {
  const router = useRouter()
  const { publishedBooks, unpublishedDrafts, isLoading, errorMessage, removeDraft } = useMyStories()
  const [activeTab, setActiveTab] = useState<StoryTabKey>("published")

  const tabs: StoryTab<StoryTabKey>[] = [
    { key: "published", label: "Publicadas", count: publishedBooks.length },
    { key: "drafts", label: "Borradores", count: unpublishedDrafts.length },
  ]

  const openPublishedBook = (bookId: string) => {
    router.push({ pathname: "/books/Details", params: { id: bookId } })
  }

  const openDraft = (draftId: string) => {
    router.push({ pathname: "/write/[draftId]", params: { draftId } })
  }

  const handleDeleteDraft = (draft: Draft) => {
    Alert.alert("Borrar borrador", `¿Borrar "${getDraftTitle(draft)}" y todos sus capítulos?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Borrar", style: "destructive", onPress: () => removeDraft(draft) },
    ])
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
            headerRight: () => <HeaderAddButton onPress={() => router.push("/write/new")} />,
        }}
      />

      <StoryTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {/* Mientras no llega la respuesta, una lista vacía no significa "no hay historias" sino "todavía no sé" */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} />
      ) : activeTab === "published" ? (
        <FlatList
          data={publishedBooks}
          keyExtractor={(book) => book.id}
          renderItem={({ item }) => (
            <StoryCard
              title={item.title}
              coverUrl={item.coverUrl}
              meta={getPublishedMeta(item)}
              badgeLabel="Publicada"
              isPublished
              onPress={() => openPublishedBook(item.id)}
            />
          )}
          ListEmptyComponent={
            !errorMessage ? (
              <Text style={styles.emptyText}>Todavía no publicaste ninguna historia.</Text>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={unpublishedDrafts}
          keyExtractor={(draft) => draft.id}
          renderItem={({ item }) => (
            <StoryCard
              title={getDraftTitle(item)}
              coverUrl={item.coverUrl}
              meta={item.tags && item.tags.length > 0 ? item.tags.join(" · ") : "Sin categorías"}
              badgeLabel={STATUS_LABELS[item.status]}
              onPress={() => openDraft(item.id)}
              onDelete={() => handleDeleteDraft(item)}
            />
          )}
          ListEmptyComponent={
            !errorMessage ? (
              <Text style={styles.emptyText}>No tenés borradores. Tocá + para empezar una historia.</Text>
            ) : null
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.m },
  loader: { marginTop: SPACING.l },
  errorText: { color: COLORS.dangerText, fontSize: FONTSIZE.s, marginTop: SPACING.m },
  emptyText: { color: COLORS.textSecondary, fontSize: FONTSIZE.s, marginTop: SPACING.l, textAlign: "center" },
})

export default MyStoriesScreen