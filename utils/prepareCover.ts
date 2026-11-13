import * as FileSystem from "expo-file-system/legacy"
import { COVER_ATTEMPTS, MAX_COVER_BYTES } from "@/data/publishData"
import { prepareImageForUpload } from "@/utils/prepareImage"

const HTTP_OK = 200

const isRemoteUri = (uri: string): boolean => uri.startsWith("http://") || uri.startsWith("https://")

const shrinkCover = (localUri: string) => prepareImageForUpload(localUri, COVER_ATTEMPTS, MAX_COVER_BYTES)

/**
 * Baja una portada de internet a un archivo temporal del celular y la achica.
 * NOTE: el achicador solo lee archivos locales; el temporal se borra siempre
 * @param string remoteUri : link de la portada
 * @returns string | null : portada en base64, o null si no se pudo bajar
 */
const shrinkRemoteCover = async (remoteUri: string): Promise<string | null> => {
  const downloadedUri = `${FileSystem.cacheDirectory}cover-download-${Date.now()}.jpg`
  try {
    const download = await FileSystem.downloadAsync(remoteUri, downloadedUri)
    if (download.status !== HTTP_OK) {
      throw new Error(`Respuesta ${download.status} al bajar la portada`)
    }
    return await shrinkCover(downloadedUri)
  } catch (error) {
    console.warn("[prepareCover] No se pudo bajar la portada:", error)
    return null
  } finally {
    await FileSystem.deleteAsync(downloadedUri, { idempotent: true })
  }
}

/**
 * Convierte la portada a un JPEG liviano, listo para subir a Storage.
 * Si algo sale mal devuelve null: el libro se publica igual, sin portada.
 * @param string | null coverUri : ruta local (epubService) o link de internet (borrador)
 * @returns string | null : portada en base64 (sin prefijo "data:")
 */
export const prepareCover = async (coverUri: string | null): Promise<string | null> => {
  if (!coverUri) return null
  return isRemoteUri(coverUri) ? shrinkRemoteCover(coverUri) : shrinkCover(coverUri)
}