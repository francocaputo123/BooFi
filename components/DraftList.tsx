import { useCallback, useState } from "react"
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet, Alert } from "react-native"
import { useFocusEffect, useRouter } from "expo-router"
import authStore from "@/store/authStore"
import { createDraft, listDrafts, deleteDraft } from "@/services/draftService"
import { Draft } from "@/types/draft.types"
import { DEFAULT_DRAFT_TITLE } from "@/constants/draftOptions"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"
import DraftCard from "@/components/DraftCard"

/** Lista las historias del usuario y permite crear una nueva */
const DraftList = () => {
  const router = useRouter()
  const uid = authStore((state) => state.public_id)

  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Evita que un doble toque cree dos historias mientras Firestore responde
  const [isCreating, setIsCreating] = useState(false)

  const openDraft = (draftId: string) => {
    router.push({ pathname: "/write/[draftId]", params: { draftId } })
  }

  const loadDrafts = async () => {
    try {
      setErrorMessage(null)
      setDrafts(await listDrafts(uid))
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // Una pestaña no se vuelve a montar al volver a ella: con useEffect la lista
  // quedaría vieja. useFocusEffect recarga cada vez que la pantalla recupera el foco.
  useFocusEffect(
    useCallback(() => {
      loadDrafts()
    }, [uid])
  )

  const handleCreateDraft = async () => {
    try {
      setIsCreating(true)
      setErrorMessage(null)
      const draftId = await createDraft(uid, DEFAULT_DRAFT_TITLE)
      openDraft(draftId)
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteDraft = (draft: Draft) => {
    Alert.alert("Borrar historia", `¿Borrar "${draft.title}" y todos sus capítulos?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDraft(uid, draft.id)
            setDrafts((current) => current.filter((item) => item.id !== draft.id))
          } catch (error) {
            setErrorMessage((error as Error).message)
          }
        },
      },
    ])
  }

  // Se mira primero la carga: mientras no llega la respuesta, una lista vacía
  // no significa "no hay historias", significa "todavía no sé".
  if (isLoading) {
    return <ActivityIndicator style={styles.loader} color={COLORS.primary} />
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.createButton, isCreating && styles.createButtonDisabled]}
        onPress={handleCreateDraft}
        disabled={isCreating}
      >
        <Text style={styles.createButtonText}>{isCreating ? "Creando..." : "Nueva historia"}</Text>
      </Pressable>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {!errorMessage && drafts.length === 0 && (
        <Text style={styles.emptyText}>
          Todavía no tenés historias. Tocá "Nueva historia" para empezar.
        </Text>
      )}

      <FlatList
        data={drafts}
        keyExtractor={(draft) => draft.id}
        renderItem={({ item }) => (
          <DraftCard
            draft={item}
            onPress={() => openDraft(item.id)}
            onDelete={() => handleDeleteDraft(item)}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  loader: {
    marginTop: SPACING.l,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: 8,
    alignItems: "center",
    marginTop: SPACING.m,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: FONTSIZE.m,
  },
  errorText: {
    color: COLORS.dangerText,
    fontSize: FONTSIZE.s,
    marginTop: SPACING.m,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTSIZE.s,
    marginTop: SPACING.m,
  },
})

export default DraftList