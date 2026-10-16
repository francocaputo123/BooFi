/*
 * Representa un capitulo extraido de un epub
 * "textPreview" es solo un adelanto del texto quizas sirva para sinopsis
 * (Probablemente sirva para sinopsis, si, seguro sirve)
 */

export interface EpubChapter {
    id: string;
    title: string;
    href: string;
    textPreview: string;
    /* Capitulo completo ya estructurado (parrafos, titulos, listas...) con su formato */
    blocks: EpubBlock[];
}

export type EpubTextAlign = "left" | "center" | "right" | "justify";

/* Formato de un tramo de texto; solo se incluyen las propiedades que estan activas */
export interface EpubTextSpan {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
}

export type EpubBlockType = "paragraph" | "heading" | "quote" | "listItem" | "divider" | "image";

export interface EpubBlock {
    type: EpubBlockType;
    spans: EpubTextSpan[];
    /* Heading: nivel 1 a 6. ListItem: profundidad de anidado (1 = lista principal) */
    level?: number;
    align?: EpubTextAlign;
    /* Solo type "image": ruta local del archivo temporal en el celu (mientras el libro vive en el dispositivo) */
    imageUri?: string;
    /* Solo type "image": URL de la imagen ya publicada en Cloud Storage (cuando el libro se lee bajado) */
    imageUrl?: string;
    /* Solo type "image": medidas en pixeles, para reservar el lugar antes de que cargue */
    imageWidth?: number;
    imageHeight?: number;
    /* Solo type "image": texto alternativo del epub */
    alt?: string;
    /* Solo type "image": ruta original dentro del epub. Es temporal: epubService la reemplaza por imageUri */
    imageHref?: string;
}

/* Estilo que el epub le asigna a un elemento (por etiqueta, CSS o atributo style) */
export interface EpubElementStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    align?: EpubTextAlign;
}

/* Regla CSS simplificada: solo selectores "tag", ".clase" o "tag.clase" */
export interface EpubCssRule {
    tag?: string;
    className?: string;
    style: EpubElementStyle;
}

/*
 * Representa un libro ya parseado a partir de un .epub
 */
export interface EpubParsedBook {
    /* Se deriva de titulo + autor para poder reconocer el mismo libro si se vuelve a cargar */
    id: string;
    title: string;
    author: string;
    /* Sinopsis del epub (campo dc:description), vacia si no trae */
    synopsis: string;
    /* Ruta en el celu de la portada tal cual venia en el epub, o null si no trae */
    coverUri: string | null;
    chapters: EpubChapter[];
}

/*
 * Resultado de validar un archivo antes de intentar procesarlo.
 */
export interface FileValidationResult {
  isValid: boolean;
  errorMessage?: string;
}