/**
 * Deja un titulo "parejo" para poder comparar: sin tildes, sin signos, en minuscula
 * y con los espacios normalizados. Asi "¡El Señor de los Anillos!" y "el senor de los anillos"
 * se consideran el mismo titulo.
 * @param title : titulo tal cual viene del epub
 * @returns string : titulo normalizado
 */
export const normalizeTitle = (title: string): string => {
    const cleanTitle = title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[.,;:!?¡¿"'“”‘’()\[\]{}\-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim()

    // Si el titulo era solo signos quedaria vacio: en ese caso se usa el original para no confundir libros distintos
    return cleanTitle || title.trim().toLowerCase()
}