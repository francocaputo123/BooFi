import {
    EpubBlock,
    EpubBlockType,
    EpubCssRule,
    EpubElementStyle,
    EpubTextSpan,
} from "@/types/epub.types"
import { normalizeAlign, parseCssDeclarations, resolveElementStyle } from "@/utils/epubCss"

const NAMED_ENTITIES: Record<string, string> = {
    nbsp: " ", lt: "<", gt: ">", quot: '"', apos: "'", amp: "&",
    mdash: "—", ndash: "–", hellip: "…", laquo: "«", raquo: "»",
    lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", iexcl: "¡", iquest: "¿", copy: "©",
    aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
    Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü",
}

/**
 * Convierte entidades HTML (&amp;, &#233;, &mdash;...) en su caracter.
 * Se reemplaza todo en una sola pasada para no decodificar dos veces ("&amp;lt;" debe quedar "&lt;").
 */
export const decodeHtmlEntities = (text: string): string => {
    return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (original, entity: string) => {
        if (entity[0] === "#") {
            const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
            return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : original
        }
        return NAMED_ENTITIES[entity] ?? original
    })
}

const HEADING_PATTERN = /^h([1-6])$/
const PARAGRAPH_LIKE_TAGS = new Set([
    "p", "div", "section", "article", "aside", "header", "footer", "figure", "figcaption",
    "dd", "dt", "caption", "tr",
])
const VOID_TAGS = new Set(["br", "hr", "img", "image", "meta", "link", "input", "col", "area", "base", "wbr"])

// Una etiqueta abierta mientras se recorre el HTML, con el formato acumulado de sus padres
interface OpenElement {
    tag: string
    style: EpubElementStyle
}

/**
 * Convierte el HTML de un capitulo en bloques (parrafos, titulos, citas, listas, divisores)
 * cuyo texto conserva negrita, cursiva, subrayado, tachado y alineacion.
 * Recorre el texto con un tokenizador propio en vez de un parser XML estricto:
 * asi un capitulo con HTML mal formado se muestra igual en lugar de fallar.
 * Las imagenes (<img> y las <svg> con <image> que usan muchas portadas) salen como bloques "image"
 * que solo traen la ruta original dentro del epub (imageHref): epubService la resuelve despues.
 * @param html : contenido de un archivo de capitulo (.xhtml)
 * @param cssRules : reglas de las hojas de estilo del epub (ver parseCssRules)
 * @returns EpubBlock[] : bloques en orden de lectura, sin bloques vacios
 */
export const parseChapterHtml = (html: string, cssRules: EpubCssRule[]): EpubBlock[] => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    const source = (bodyMatch ? bodyMatch[1] : html)
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<head[\s\S]*?<\/head>/gi, "")
        .replace(/<svg[\s\S]*?<\/svg>/gi, convertSvgToImage)
        .replace(/<(script|style|title)[\s\S]*?<\/\1>/gi, "")

    const blocks: EpubBlock[] = []
    const openElements: OpenElement[] = []
    const listStack: { ordered: boolean; counter: number }[] = []

    let spans: EpubTextSpan[] = []
    let isBlockOpen = false
    let blockType: EpubBlockType = "paragraph"
    let blockLevel: number | undefined
    let blockAlign: EpubElementStyle["align"]
    let quoteDepth = 0
    let preDepth = 0

    const currentStyle = (): EpubElementStyle => {
        return openElements.length > 0 ? openElements[openElements.length - 1].style : {}
    }

    const flushBlock = () => {
        if (!isBlockOpen) return

        // Se limpia el espacio sobrante del final para que el parrafo no termine con un hueco
        if (spans.length > 0 && preDepth === 0) {
            const last = spans[spans.length - 1]
            last.text = last.text.replace(/\s+$/, "")
        }
        const cleanSpans = spans.filter((span) => span.text.length > 0)

        if (cleanSpans.some((span) => span.text.trim().length > 0)) {
            const block: EpubBlock = { type: blockType, spans: cleanSpans }
            if (blockLevel !== undefined) block.level = blockLevel
            if (blockAlign) block.align = blockAlign
            blocks.push(block)
        }

        spans = []
        isBlockOpen = false
        blockLevel = undefined
        blockAlign = undefined
    }

    const startBlock = (type: EpubBlockType, level?: number) => {
        flushBlock()
        isBlockOpen = true
        // Un parrafo dentro de <blockquote> se muestra como cita
        blockType = type === "paragraph" && quoteDepth > 0 ? "quote" : type
        blockLevel = level
        blockAlign = currentStyle().align
    }

    const appendSpan = (text: string, style: EpubElementStyle) => {
        const span: EpubTextSpan = { text }
        if (style.bold) span.bold = true
        if (style.italic) span.italic = true
        if (style.underline) span.underline = true
        if (style.strike) span.strike = true
        if (style.code) span.code = true

        const previous = spans[spans.length - 1]
        const hasSameFormat = previous
            && !!previous.bold === !!span.bold
            && !!previous.italic === !!span.italic
            && !!previous.underline === !!span.underline
            && !!previous.strike === !!span.strike
            && !!previous.code === !!span.code

        if (hasSameFormat) previous.text += text
        else spans.push(span)
    }

    const appendText = (rawText: string) => {
        let text = decodeHtmlEntities(rawText)
        if (preDepth === 0) text = text.replace(/\s+/g, " ")

        if (!isBlockOpen) {
            if (text.trim().length === 0) return
            startBlock("paragraph")
        }

        // Si el bloque esta vacio o ya termina en espacio, un espacio mas solo ensucia
        if (preDepth === 0) {
            const currentText = spans.map((span) => span.text).join("")
            if (currentText.length === 0 || /\s$/.test(currentText)) text = text.replace(/^\s+/, "")
        }
        if (text.length === 0) return

        appendSpan(text, currentStyle())
    }

    const closeElement = (element: OpenElement) => {
        const { tag } = element
        if (tag === "ul" || tag === "ol") {
            flushBlock()
            listStack.pop()
        } else if (tag === "blockquote") {
            flushBlock()
            quoteDepth = Math.max(0, quoteDepth - 1)
        } else if (tag === "pre") {
            flushBlock()
            preDepth = Math.max(0, preDepth - 1)
        } else if (tag === "td" || tag === "th") {
            if (isBlockOpen) appendSpan(" ", {})
        } else if (tag === "li" || tag === "p" || HEADING_PATTERN.test(tag) || PARAGRAPH_LIKE_TAGS.has(tag)) {
            flushBlock()
        }
    }

    const tokenPattern = /<\/?([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>|([^<]+)|(<)/g
    let token: RegExpExecArray | null

    while ((token = tokenPattern.exec(source)) !== null) {
        const [fullMatch, rawTag, rawAttributes, text, strayBracket] = token

        if (text !== undefined || strayBracket !== undefined) {
            appendText(text ?? strayBracket)
            continue
        }

        const tag = rawTag.toLowerCase()

        // --- etiqueta de cierre ---
        if (fullMatch.startsWith("</")) {
            const openIndex = openElements.map((element) => element.tag).lastIndexOf(tag)
            if (openIndex === -1) continue // cierre sin apertura: HTML mal formado, se ignora

            // Cierra tambien lo que quedo abierto adentro (por ejemplo un <span> sin cerrar)
            while (openElements.length > openIndex) {
                closeElement(openElements.pop() as OpenElement)
            }
            continue
        }

        // --- etiqueta de apertura ---
        const attributes = parseAttributes(rawAttributes)
        const isSelfClosing = rawAttributes.trim().endsWith("/") || VOID_TAGS.has(tag)

        if (tag === "br") {
            if (isBlockOpen) appendSpan("\n", {})
            continue
        }
        if (tag === "hr") {
            flushBlock()
            blocks.push({ type: "divider", spans: [] })
            continue
        }
        if (tag === "img") {
            // Una imagen corta el parrafo en el que esta y queda como bloque propio
            const imageHref = attributes.src
            if (imageHref) {
                flushBlock()
                const imageBlock: EpubBlock = { type: "image", spans: [], imageHref }
                if (attributes.alt) imageBlock.alt = decodeHtmlEntities(attributes.alt)
                blocks.push(imageBlock)
            }
            continue
        }
        if (VOID_TAGS.has(tag)) continue

        const classNames = (attributes.class ?? "").split(/\s+/).filter(Boolean)
        const ownStyle: EpubElementStyle = {
            ...resolveElementStyle(tag, classNames, cssRules),
            ...(attributes.style ? parseCssDeclarations(attributes.style) : {}),
        }
        const alignAttribute = attributes.align ? normalizeAlign(attributes.align) : undefined
        if (alignAttribute) ownStyle.align = alignAttribute

        // El formato se hereda: lo que esta adentro de <b> o de una clase en negrita tambien lo es
        const element: OpenElement = { tag, style: { ...currentStyle(), ...ownStyle } }

        if (isSelfClosing) {
            // <p/> o <span/> no tienen contenido: solo corta el bloque
            if (PARAGRAPH_LIKE_TAGS.has(tag)) flushBlock()
            continue
        }

        const headingMatch = tag.match(HEADING_PATTERN)

        if (tag === "ul" || tag === "ol") {
            flushBlock()
            openElements.push(element)
            listStack.push({ ordered: tag === "ol", counter: 0 })
        } else if (tag === "li") {
            flushBlock()
            openElements.push(element)
            const list = listStack[listStack.length - 1]
            if (list) list.counter++
            startBlock("listItem", Math.max(1, listStack.length))
            appendSpan(list?.ordered ? `${list.counter}. ` : "• ", {})
        } else if (tag === "blockquote") {
            flushBlock()
            openElements.push(element)
            quoteDepth++
        } else if (tag === "pre") {
            flushBlock()
            openElements.push(element)
            preDepth++
            startBlock("paragraph")
        } else if (headingMatch) {
            flushBlock()
            openElements.push(element)
            startBlock("heading", Number(headingMatch[1]))
        } else if (PARAGRAPH_LIKE_TAGS.has(tag)) {
            flushBlock()
            openElements.push(element)
            startBlock("paragraph")
        } else {
            // span, a, b, i, u, etc.: solo aportan formato al texto que contienen
            openElements.push(element)
        }
    }

    flushBlock()
    return blocks
}

/*
 * Muchas portadas vienen como <svg><image xlink:href="..."/></svg>. Se las convierte en un <img>
 * para tratarlas igual que cualquier imagen; un svg sin <image> (dibujos, iconos) se descarta.
 */
const convertSvgToImage = (svgHtml: string): string => {
    const imageMatch = svgHtml.match(/<image\b[^>]*?\b(?:xlink:)?href\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
    const imageHref = imageMatch ? (imageMatch[1] ?? imageMatch[2]) : ""
    return imageHref ? `<img src="${imageHref}"/>` : ""
}

const parseAttributes = (rawAttributes: string): Record<string, string> => {
    const attributes: Record<string, string> = {}
    const attributePattern = /([a-zA-Z_:][-\w:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

    let match: RegExpExecArray | null
    while ((match = attributePattern.exec(rawAttributes)) !== null) {
        attributes[match[1].toLowerCase()] = match[2] ?? match[3]
    }
    return attributes
}

/**
 * Texto plano de una lista de bloques (para vistas previas y busquedas).
 */
export const blocksToPlainText = (blocks: EpubBlock[]): string => {
    return blocks
        .map((block) => block.spans.map((span) => span.text).join(""))
        .filter((text) => text.length > 0)
        .join("\n\n")
}