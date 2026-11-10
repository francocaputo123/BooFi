import { useState } from "react"
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native"
import { Stack } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useCreateDraft } from "@/hooks/useCreateDraft"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

const SYNOPSIS_MAX_LENGTH = 500

/** Paso 1 de la creación de una historia: título y descripción antes de empezar a escribir */
const NewDraftScreen = () => {
  const { createAndOpenDraft, isCreating, errorMessage } = useCreateDraft()

  const [title, setTitle] = useState("")
  const [synopsis, setSynopsis] = useState("")

  const handleContinue = () => createAndOpenDraft(title.trim(), synopsis.trim())

  // Omitir crea la historia vacía: los datos se completan después desde Configuración
  const handleSkip = () => createAndOpenDraft("", "")

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={handleSkip} disabled={isCreating}>
              <Text style={styles.skipText}>Omitir</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.steps}>
          <Text style={[styles.step, styles.stepActive]}>1  Configuración</Text>
          <Text style={styles.step}>2  Escribir</Text>
        </View>

        <Text style={styles.heading}>Configurá tu historia</Text>
        <Text style={styles.subheading}>Dale una identidad antes de empezar.</Text>

        {/* TODO: portada de la historia (RF6.4), por ahora deshabilitada */}
        <View style={[styles.coverCard, styles.coverCardDisabled]}>
          <View style={styles.coverBox}>
            <Ionicons name="image-outline" size={26} color={COLORS.primary} />
          </View>
          <View style={styles.coverTexts}>
            <Text style={styles.coverTitle}>Agregar portada</Text>
            <Text style={styles.coverSubtitle}>Próximamente</Text>
          </View>
        </View>

        <Text style={styles.label}>Título de la historia</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Escribí el título de tu historia"
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Descripción de la historia</Text>
        <TextInput
          style={[styles.input, styles.synopsisInput]}
          value={synopsis}
          onChangeText={setSynopsis}
          placeholder={"¿De qué trata tu historia?\nDejá una pista que invite a leer."}
          placeholderTextColor={COLORS.textSecondary}
          multiline
          maxLength={SYNOPSIS_MAX_LENGTH}
          textAlignVertical="top"
        />
        <Text style={styles.counter}>{synopsis.length} / {SYNOPSIS_MAX_LENGTH}</Text>

        <Text style={styles.hint}>Podés completar o editar estos datos después.</Text>

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.continueButton, isCreating && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={isCreating}
        >
          <Text style={styles.continueButtonText}>{isCreating ? "Creando..." : "Continuar"}</Text>
        </Pressable>
        <Text style={styles.footerHint}>El próximo paso es escribir tu primer capítulo.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.m },
  skipText: { fontSize: FONTSIZE.m, color: COLORS.primary },
  steps: {
    flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: 10, padding: SPACING.xs,
  },
  step: {
    flex: 1, textAlign: "center", paddingVertical: SPACING.s, fontSize: FONTSIZE.s,
    color: COLORS.textSecondary,
  },
  stepActive: {
    backgroundColor: COLORS.background, borderRadius: 8, color: COLORS.primary, fontWeight: "600",
  },
  heading: { fontSize: FONTSIZE.xl, fontWeight: "bold", color: COLORS.text, marginTop: SPACING.l },
  subheading: { fontSize: FONTSIZE.s, color: COLORS.textSecondary, marginTop: SPACING.xs },
  coverCard: {
    flexDirection: "row", gap: SPACING.m, alignItems: "center", backgroundColor: COLORS.surface,
    borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: SPACING.m,
    marginTop: SPACING.l,
  },
  coverCardDisabled: { opacity: 0.5 },
  coverBox: {
    width: 72, height: 96, borderRadius: 8, backgroundColor: COLORS.background,
    alignItems: "center", justifyContent: "center",
  },
  coverTexts: { flex: 1 },
  coverTitle: { fontSize: FONTSIZE.m, fontWeight: "600", color: COLORS.text },
  coverSubtitle: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary },
  label: { fontSize: FONTSIZE.s, color: COLORS.text, marginTop: SPACING.l, marginBottom: SPACING.s },
  input: {
    fontSize: FONTSIZE.m, color: COLORS.text, backgroundColor: COLORS.surface,
    borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, padding: SPACING.m,
  },
  synopsisInput: { minHeight: 120 },
  counter: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary, textAlign: "right", marginTop: SPACING.xs },
  hint: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary, marginTop: SPACING.m },
  errorText: { color: COLORS.dangerText, marginTop: SPACING.m },
  footer: {
    padding: SPACING.m, borderTopColor: COLORS.border, borderTopWidth: 1, backgroundColor: COLORS.background,
  },
  continueButton: {
    backgroundColor: COLORS.primary, padding: SPACING.m, borderRadius: 12, alignItems: "center",
  },
  continueButtonDisabled: { opacity: 0.5 },
  continueButtonText: { color: "#fff", fontSize: FONTSIZE.m, fontWeight: "600" },
  footerHint: { fontSize: FONTSIZE.xs, color: COLORS.textSecondary, textAlign: "center", marginTop: SPACING.s },
})

export default NewDraftScreen