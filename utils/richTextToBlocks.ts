import type { EpubBlock, EpubTextSpan } from "@/types/epub.types"

/* Nodo del JSON que entrega el editor (formato ProseMirror/TipTap) */
interface RichTextNode {
  type: string
  text?: string
  attrs?: { level?: number }
  marks?: { type: string }[]
  content?: RichTextNode[]
}

type SpanFormat = Exclude<keyof EpubTextSpan, "text">

/* Marcas del editor que el lector sabe mostrar */
const MARK_TO_FORMAT: Record<string, SpanFormat> = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  strike: "strike",
  code: "code",
}

const MIN_HEADING_LEVEL = 1
const MAX_HEADING_LEVEL = 6

/**
 * Convierte los nodos de texto de un párrafo en tramos con formato.
 * @param RichTextNode[] nodes : hijos del párrafo, título o ítem
 * @returns EpubTextSpan[]
 */
const nodesToSpans = (nodes: RichTextNode[] = []): EpubTextSpan[] =>
  nodes.flatMap((node): EpubTextSpan[] => {
    if (node.type === "hardBreak") return [{ text: "\n" }]
    if (node.type !== "text" || !node.text) return nodesToSpans(node.content)

    const span: EpubTextSpan = { text: node.text }
    node.marks?.forEach((mark) => {
      const format = MARK_TO_FORMAT[mark.type]
      if (format) span[format] = true
    })
    return [span]
  })

/**
 * Saca los espacios y saltos sobrantes del principio y del final del bloque.
 * @param EpubTextSpan[] spans : tramos del bloque
 * @returns EpubTextSpan[] (vacío si no queda texto)
 */
const trimSpans = (spans: EpubTextSpan[]): EpubTextSpan[] => {
  const trimmed = spans.map((span) => ({ ...span }))
  if (trimmed.length > 0) trimmed[0].text = trimmed[0].text.trimStart()
  if (trimmed.length > 0) trimmed[trimmed.length - 1].text = trimmed[trimmed.length - 1].text.trimEnd()
  return trimmed.filter((span) => span.text !== "")
}

/**
 * Recorre un nodo y devuelve los bloques del lector que le corresponden.
 * Las estructuras anidadas se aplanan: una lista dentro de una cita queda como lista.
 * @param RichTextNode node : nodo a convertir
 * @param number listDepth : profundidad de listas ya recorridas (0 = ninguna)
 * @param boolean isInQuote : true si está dentro de una cita
 * @returns EpubBlock[]
 */
const nodeToBlocks = (node: RichTextNode, listDepth: number, isInQuote: boolean): EpubBlock[] => {
  const children = node.content ?? []

  switch (node.type) {
    case "heading": {
      const spans = trimSpans(nodesToSpans(children))
      const level = Math.min(Math.max(node.attrs?.level ?? MIN_HEADING_LEVEL, MIN_HEADING_LEVEL), MAX_HEADING_LEVEL)
      return spans.length > 0 ? [{ type: "heading", spans, level }] : []
    }

    case "paragraph": {
      const spans = trimSpans(nodesToSpans(children))
      if (spans.length === 0) return []
      if (listDepth > 0) return [{ type: "listItem", spans, level: listDepth }]
      return [{ type: isInQuote ? "quote" : "paragraph", spans }]
    }

    case "blockquote":
      return children.flatMap((child) => nodeToBlocks(child, listDepth, true))

    case "bulletList":
    case "orderedList":
      return children.flatMap((child) => nodeToBlocks(child, listDepth + 1, isInQuote))

    case "horizontalRule":
      return [{ type: "divider", spans: [] }]

    default:
      return children.flatMap((child) => nodeToBlocks(child, listDepth, isInQuote))
  }
}

/**
 * Convierte el contenido de un capítulo escrito con el editor en bloques del lector.
 * @param string content : JSON del editor guardado como texto
 * @returns EpubBlock[] | null : null si el contenido no es del editor (ej. texto plano viejo)
 */
const richTextToBlocks = (content: string): EpubBlock[] | null => {
  try {
    const doc: RichTextNode = JSON.parse(content)
    if (doc?.type !== "doc") return null
    return nodeToBlocks(doc, 0, false)
  } catch {
    return null
  }
}

export default richTextToBlocks