import { useEffect, useMemo } from "react"
import { View, ScrollView, Pressable, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { RichText, useEditorBridge, useBridgeState, useEditorContent } from "@10play/tentap-editor"
import { COLORS } from "@/constants/theme"

const ICON_SIZE = 22

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"]

type RichTextEditorProps = {
  /* Contenido guardado del capítulo: JSON del editor, texto plano viejo o vacío */
  initialContent: string
  /* Se llama en cada cambio con el JSON como texto, o "" si el capítulo quedó vacío */
  onChange: (content: string) => void
}

type ToolButtonProps = {
  icon: IconName
  isActive?: boolean
  isDisabled?: boolean
  onPress: () => void
}

interface EditorNode {
  type: string
  content?: EditorNode[]
}

/**
 * Convierte texto plano en HTML: un párrafo por línea (para capítulos escritos antes del editor).
 * @param string text : texto plano del capítulo
 * @returns string
 */
const plainTextToHtml = (text: string): string =>
  text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => `<p>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("")

/**
 * Decide qué contenido recibe el editor al abrirse.
 * @param string content : contenido guardado
 * @returns objeto del editor si es JSON, o HTML si era texto plano
 */
const getEditorInitialContent = (content: string) => {
  try {
    const doc = JSON.parse(content)
    if (doc?.type === "doc") return doc
  } catch {
    // NOTE: no es JSON, es texto plano (capítulo viejo) o está vacío
  }
  return plainTextToHtml(content)
}

/**
 * Indica si el documento no tiene texto (solo párrafos vacíos).
 * @param EditorNode doc : documento del editor
 * @returns boolean
 */
const isEmptyDoc = (doc: EditorNode): boolean =>
  !doc.content || doc.content.every((node) => node.type === "paragraph" && !node.content?.length)

/**
 * Botón de la barra de herramientas: se resalta cuando el formato está activo.
 * @param ToolButtonProps props : icono, estado activo/deshabilitado y acción
 * @returns JSX.Element
 */
const ToolButton = ({ icon, isActive = false, isDisabled = false, onPress }: ToolButtonProps) => (
  <Pressable
    style={[styles.toolButton, isActive && styles.toolButtonActive]}
    onPress={onPress}
    disabled={isDisabled}
  >
    <MaterialCommunityIcons
      name={icon}
      size={ICON_SIZE}
      color={isDisabled ? COLORS.border : isActive ? COLORS.primary : COLORS.text}
    />
  </Pressable>
)

/**
 * Editor de texto enriquecido con barra de herramientas.
 * @param RichTextEditorProps props : contenido inicial y función que recibe los cambios
 * @returns JSX.Element
 */
const RichTextEditor = ({ initialContent, onChange }: RichTextEditorProps) => {
  // useMemo: el contenido inicial se calcula una sola vez, no en cada render
  const startContent = useMemo(() => getEditorInitialContent(initialContent), [])

  const editor = useEditorBridge({
    autofocus: true,
    initialContent: startContent,
  })
  const editorState = useBridgeState(editor)
  const doc = useEditorContent(editor, { type: "json" })

  useEffect(() => {
    if (!doc) return
    onChange(isEmptyDoc(doc as EditorNode) ? "" : JSON.stringify(doc))
  }, [doc])

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ToolButton icon="format-bold" isActive={editorState.isBoldActive} onPress={() => editor.toggleBold()} />
          <ToolButton icon="format-italic" isActive={editorState.isItalicActive} onPress={() => editor.toggleItalic()} />
          <ToolButton icon="format-underline" isActive={editorState.isUnderlineActive} onPress={() => editor.toggleUnderline()} />
          <ToolButton icon="format-header-1" isActive={editorState.headingLevel === 1} onPress={() => editor.toggleHeading(1)} />
          <ToolButton icon="format-header-2" isActive={editorState.headingLevel === 2} onPress={() => editor.toggleHeading(2)} />
          <ToolButton icon="format-quote-close" isActive={editorState.isBlockquoteActive} onPress={() => editor.toggleBlockquote()} />
          <ToolButton icon="format-list-bulleted" isActive={editorState.isBulletListActive} onPress={() => editor.toggleBulletList()} />
          <ToolButton icon="format-list-numbered" isActive={editorState.isOrderedListActive} onPress={() => editor.toggleOrderedList()} />
          <ToolButton icon="undo" isDisabled={!editorState.canUndo} onPress={() => editor.undo()} />
          <ToolButton icon="redo" isDisabled={!editorState.canRedo} onPress={() => editor.redo()} />
        </ScrollView>
      </View>
      <View style={styles.editor}>
        <RichText editor={editor} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { height: 48, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  toolButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  toolButtonActive: { backgroundColor: COLORS.surface },
  editor: { flex: 1 },
})

export default RichTextEditor