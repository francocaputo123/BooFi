import { EpubCssRule, EpubElementStyle, EpubTextAlign } from "@/types/epub.types"

// Formato que tiene cada etiqueta HTML aunque el epub no traiga CSS
const TAG_DEFAULT_STYLES: Record<string, EpubElementStyle> = {
    b: { bold: true },
    strong: { bold: true },
    th: { bold: true },
    h1: { bold: true },
    h2: { bold: true },
    h3: { bold: true },
    h4: { bold: true },
    h5: { bold: true },
    h6: { bold: true },
    i: { italic: true },
    em: { italic: true },
    cite: { italic: true },
    dfn: { italic: true },
    u: { underline: true },
    ins: { underline: true },
    s: { strike: true },
    strike: { strike: true },
    del: { strike: true },
    code: { code: true },
    tt: { code: true },
    kbd: { code: true },
    samp: { code: true },
    pre: { code: true },
    center: { align: "center" },
}

/**
 * Convierte declaraciones CSS ("font-weight: bold; text-align: center") en un EpubElementStyle.
 * Solo reconoce las propiedades que el lector sabe dibujar; el resto se ignora.
 * Se usa tanto para las hojas de estilo del epub como para el atributo style="" de cada etiqueta.
 */
export const parseCssDeclarations = (declarations: string): EpubElementStyle => {
    const style: EpubElementStyle = {}

    declarations.split(";").forEach((declaration) => {
        const separatorIndex = declaration.indexOf(":")
        if (separatorIndex === -1) return

        const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
        const value = declaration.slice(separatorIndex + 1).replace(/!important/gi, "").trim().toLowerCase()

        if (property === "font-weight") {
            if (value === "bold" || value === "bolder" || /^[6-9]00$/.test(value)) style.bold = true
            else if (value === "normal" || value === "lighter" || /^[1-5]00$/.test(value)) style.bold = false
        } else if (property === "font-style") {
            if (value === "italic" || value === "oblique") style.italic = true
            else if (value === "normal") style.italic = false
        } else if (property === "text-decoration" || property === "text-decoration-line") {
            if (value.includes("none")) {
                style.underline = false
                style.strike = false
            } else {
                if (value.includes("underline")) style.underline = true
                if (value.includes("line-through")) style.strike = true
            }
        } else if (property === "text-align") {
            const align = normalizeAlign(value)
            if (align) style.align = align
        }
    })

    return style
}

export const normalizeAlign = (value: string): EpubTextAlign | undefined => {
    const lower = value.trim().toLowerCase()
    if (lower === "left" || lower === "start") return "left"
    if (lower === "right" || lower === "end") return "right"
    if (lower === "center") return "center"
    if (lower === "justify") return "justify"
    return undefined
}

/**
 * Lee una hoja de estilos y se queda con las reglas simples (".clase", "p", "p.clase").
 * Muchos epubs (por ejemplo los de Calibre) ponen la negrita o la cursiva en una clase CSS
 * en lugar de usar <b> o <i>, por eso hace falta leer el CSS para respetar el formato.
 * Los selectores complejos (descendientes, ids, pseudo-clases) se ignoran a proposito.
 */
export const parseCssRules = (css: string): EpubCssRule[] => {
    const rules: EpubCssRule[] = []
    const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, "")
    const rulePattern = /([^{}]+)\{([^{}]*)\}/g

    let match: RegExpExecArray | null
    while ((match = rulePattern.exec(cleanCss)) !== null) {
        const selectorList = match[1].trim()
        if (selectorList.startsWith("@")) continue // @font-face, @page, etc.

        const style = parseCssDeclarations(match[2])
        if (Object.keys(style).length === 0) continue

        selectorList.split(",").forEach((selector) => {
            const simpleSelector = selector.trim().match(/^([a-z][a-z0-9]*)?(?:\.([\w-]+))?$/i)
            if (!simpleSelector || (!simpleSelector[1] && !simpleSelector[2])) return

            rules.push({
                tag: simpleSelector[1]?.toLowerCase(),
                className: simpleSelector[2],
                style,
            })
        })
    }

    return rules
}

/**
 * Calcula el estilo propio de un elemento: primero el de la etiqueta,
 * despues las reglas CSS por etiqueta y por ultimo las de clase (que ganan, como en CSS).
 * No incluye el atributo style="", eso lo suma quien llama porque es lo mas especifico.
 */
export const resolveElementStyle = (
    tag: string,
    classNames: string[],
    rules: EpubCssRule[]
): EpubElementStyle => {
    let style: EpubElementStyle = { ...TAG_DEFAULT_STYLES[tag] }

    rules.forEach((rule) => {
        if (rule.tag === tag && !rule.className) style = { ...style, ...rule.style }
    })

    rules.forEach((rule) => {
        if (!rule.className || !classNames.includes(rule.className)) return
        if (rule.tag && rule.tag !== tag) return
        style = { ...style, ...rule.style }
    })

    return style
}
