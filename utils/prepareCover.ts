import { COVER_ATTEMPTS, MAX_COVER_BYTES } from "@/data/publishData"
import { prepareImageForUpload } from "@/utils/prepareImage"

/**
 * Achica la portada para que pese poco: la convierte a JPEG y la redimensiona.
 * Delega el achique en prepareImageForUpload usando los intentos y el limite propios de la portada.
 * Si algo sale mal devuelve null: el libro se publica igual, sin portada.
 * @param coverUri : ruta de la portada original en el celu (viene de epubService)
 * @returns string | null : portada en base64 (sin prefijo "data:"), lista para subir a Storage
 */
export const prepareCover = async (coverUri: string | null): Promise<string | null> => {
    if (!coverUri) return null
    return prepareImageForUpload(coverUri, COVER_ATTEMPTS, MAX_COVER_BYTES)
}