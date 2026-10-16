import { memo } from "react";
import { Platform, StyleSheet, Text, TextStyle, View } from "react-native";
import EpubImageView from "@/components/EpubImageView";
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme";
import { HEADING_FONT_SIZES } from "@/data/readingData";
import { EpubTextSpan } from "@/types/epub.types";
import { EpubBlockViewProps } from "@/types/reading.types";

// Cada span es un <Text> anidado: asi un mismo parrafo mezcla negrita, cursiva, etc.
const getSpanStyle = (span: EpubTextSpan): TextStyle => {
    const style: TextStyle = {}

    if (span.bold) style.fontWeight = "700"
    if (span.italic) style.fontStyle = "italic"
    if (span.underline && span.strike) style.textDecorationLine = "underline line-through"
    else if (span.underline) style.textDecorationLine = "underline"
    else if (span.strike) style.textDecorationLine = "line-through"
    if (span.code) style.fontFamily = Platform.select({ ios: "Menlo", default: "monospace" })

    return style
}

/**
 * Dibuja un bloque del capitulo (parrafo, titulo, cita, item de lista, imagen o divisor)
 * respetando el formato que traia el epub.
 */
const EpubBlockView = ({ block }: EpubBlockViewProps) => {
    if (block.type === "divider") {
        return <View style={styles.divider} />
    }

    if (block.type === "image") {
        // Los libros recien cargados traen imageUri (ruta local); los publicados traen imageUrl (Storage)
        const uri = block.imageUrl ?? block.imageUri
        if (!uri) return null
        return (
            <EpubImageView
                uri={uri}
                width={block.imageWidth}
                height={block.imageHeight}
                alt={block.alt}
            />
        )
    }

    const spans = block.spans.map((span, index) => (
        <Text key={index} style={getSpanStyle(span)}>{span.text}</Text>
    ))
    const alignStyle: TextStyle | undefined = block.align ? { textAlign: block.align } : undefined

    if (block.type === "heading") {
        const fontSize = HEADING_FONT_SIZES[block.level ?? 1] ?? FONTSIZE.m
        return (
            <Text style={[styles.text, styles.heading, { fontSize, lineHeight: fontSize * 1.3 }, alignStyle]}>
                {spans}
            </Text>
        )
    }

    if (block.type === "quote") {
        return (
            <View style={styles.quote}>
                <Text style={[styles.text, alignStyle]}>{spans}</Text>
            </View>
        )
    }

    if (block.type === "listItem") {
        return (
            <Text style={[styles.text, styles.listItem, { marginLeft: SPACING.m * (block.level ?? 1) }, alignStyle]}>
                {spans}
            </Text>
        )
    }

    return <Text style={[styles.text, styles.paragraph, alignStyle]}>{spans}</Text>
}

const styles = StyleSheet.create({
    text: {
        color: COLORS.text,
        fontSize: FONTSIZE.m,
        lineHeight: 26,
    },
    paragraph: {
        marginBottom: SPACING.m,
    },
    heading: {
        marginTop: SPACING.s,
        marginBottom: SPACING.m,
    },
    quote: {
        borderLeftWidth: 3,
        borderLeftColor: COLORS.border,
        paddingLeft: SPACING.m,
        marginBottom: SPACING.m,
    },
    listItem: {
        marginBottom: SPACING.xs,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.m,
    },
})

// memo: un capitulo largo tiene cientos de bloques y no hace falta redibujarlos al cambiar el scroll
export default memo(EpubBlockView)