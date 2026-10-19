export interface ImageSize {
    width: number
    height: number
}

const readUint16BE = (bytes: Uint8Array, offset: number): number => (bytes[offset] << 8) | bytes[offset + 1]
const readUint16LE = (bytes: Uint8Array, offset: number): number => bytes[offset] | (bytes[offset + 1] << 8)
const readUint32BE = (bytes: Uint8Array, offset: number): number =>
    ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0
const readUint24LE = (bytes: Uint8Array, offset: number): number =>
    bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)

const hasText = (bytes: Uint8Array, offset: number, text: string): boolean => {
    for (let index = 0; index < text.length; index++) {
        if (bytes[offset + index] !== text.charCodeAt(index)) return false
    }
    return true
}

const readPngSize = (bytes: Uint8Array): ImageSize | null => {
    if (bytes.length < 24 || bytes[0] !== 0x89 || !hasText(bytes, 1, "PNG")) return null
    return { width: readUint32BE(bytes, 16), height: readUint32BE(bytes, 20) }
}

const readGifSize = (bytes: Uint8Array): ImageSize | null => {
    if (bytes.length < 10 || !hasText(bytes, 0, "GIF8")) return null
    return { width: readUint16LE(bytes, 6), height: readUint16LE(bytes, 8) }
}

// Marcadores JPEG "Start Of Frame": son los que traen el alto y el ancho
const isJpegFrameMarker = (marker: number): boolean =>
    marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc

const readJpegSize = (bytes: Uint8Array): ImageSize | null => {
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null

    let offset = 2
    while (offset + 4 <= bytes.length) {
        if (bytes[offset] !== 0xff) {
            offset++
            continue
        }
        const marker = bytes[offset + 1]
        if (marker === 0xff) {
            offset++ // relleno entre marcadores
            continue
        }
        // Marcadores sin contenido: no tienen largo
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            offset += 2
            continue
        }
        if (isJpegFrameMarker(marker)) {
            if (offset + 9 > bytes.length) return null
            return { height: readUint16BE(bytes, offset + 5), width: readUint16BE(bytes, offset + 7) }
        }
        offset += 2 + readUint16BE(bytes, offset + 2)
    }
    return null
}

const readWebpSize = (bytes: Uint8Array): ImageSize | null => {
    if (bytes.length < 30 || !hasText(bytes, 0, "RIFF") || !hasText(bytes, 8, "WEBP")) return null

    if (hasText(bytes, 12, "VP8 ")) {
        return { width: readUint16LE(bytes, 26) & 0x3fff, height: readUint16LE(bytes, 28) & 0x3fff }
    }
    if (hasText(bytes, 12, "VP8L")) {
        const packed = (bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24)) >>> 0
        return { width: (packed & 0x3fff) + 1, height: ((packed >>> 14) & 0x3fff) + 1 }
    }
    if (hasText(bytes, 12, "VP8X")) {
        return { width: readUint24LE(bytes, 24) + 1, height: readUint24LE(bytes, 27) + 1 }
    }
    return null
}

/**
 * Lee el ancho y el alto de una imagen mirando solo los primeros bytes del archivo (PNG, JPEG, GIF y WebP).
 * Sirve para reservar el espacio de la imagen en el lector antes de que cargue, y asi el texto no "salta".
 * @param bytes : contenido del archivo de imagen
 * @returns ImageSize | null : medidas en pixeles, o null si el formato no se reconoce
 */
export const getImageSize = (bytes: Uint8Array): ImageSize | null => {
    const size = readPngSize(bytes) ?? readJpegSize(bytes) ?? readGifSize(bytes) ?? readWebpSize(bytes)
    if (!size || size.width <= 0 || size.height <= 0) return null
    return size
}