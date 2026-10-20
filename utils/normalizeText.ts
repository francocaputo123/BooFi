/**
 * Deja un texto listo para comparar: sin tildes, en minusculas y con espacios prolijos.
 * Sirve para que "garcia", "García" y "  GARCÍA " se consideren lo mismo al buscar.
 * @param text : texto original
 * @returns string : texto normalizado
 */
export const normalizeText = (text: string): string =>
    text
        .normalize("NFD")
        // Despues de NFD las tildes quedan como marcas separadas (U+0300 a U+036F) y se pueden borrar
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
