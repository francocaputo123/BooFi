import * as FileSystem from "expo-file-system/legacy"
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"

/* Un intento de achique: ancho objetivo y calidad JPEG */
export interface ImageAttempt {
    width: number
    quality: number
}

/* Cuantos bytes pesa una imagen en base64 (cada 4 letras de base64 son 3 bytes) */
const base64ToBytes = (base64: string): number => Math.floor((base64.length * 3) / 4)

/**
 * Achica una imagen para que pese poco: la convierte a JPEG y la redimensiona.
 * Prueba con los intentos recibidos (de mejor a mas liviano) y se queda con el primero
 * que no pase el limite de bytes. Nunca agranda una imagen que ya es mas chica que el ancho pedido.
 * Si algo sale mal devuelve null: la imagen simplemente no se sube.
 * @param uri : ruta local de la imagen a achicar
 * @param attempts : intentos de achique, del mejor al mas liviano (ver publishData)
 * @param maxBytes : peso maximo permitido para la imagen final
 * @returns string | null : imagen en base64 (sin prefijo "data:"), lista para subir a Storage
 */
export const prepareImageForUpload = async (
    uri: string,
    attempts: ImageAttempt[],
    maxBytes: number
): Promise<string | null> => {
    try {
        const originalImage = await ImageManipulator.manipulate(uri).renderAsync()
        let lastBase64: string | null = null

        for (const attempt of attempts) {
            const width = Math.min(attempt.width, originalImage.width)
            const resizedImage = await ImageManipulator.manipulate(originalImage)
                .resize({ width })
                .renderAsync()
            const result = await resizedImage.saveAsync({
                format: SaveFormat.JPEG,
                compress: attempt.quality,
                base64: true,
            })

            // Cada intento genera un archivo temporal: se borra apenas se lee
            await FileSystem.deleteAsync(result.uri, { idempotent: true })

            if (!result.base64) continue
            lastBase64 = result.base64

            if (base64ToBytes(result.base64) <= maxBytes) {
                return result.base64
            }
        }

        // Ningun intento llego al limite: se devuelve el mas liviano (es el ultimo)
        return lastBase64
    } catch (error) {
        console.warn("[prepareImage] No se pudo achicar la imagen:", error)
        return null
    }
}