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
}

/*
 * Representa un libro ya parseado a partir de un .epub
 */
export interface EpubParsedBook {
    title: string;
    author: string;
    chapters: EpubChapter[];
}

/*
 * Resultado de validar un archivo antes de intentar procesarlo.
 */
export interface FileValidationResult {
  isValid: boolean;
  errorMessage?: string;
}