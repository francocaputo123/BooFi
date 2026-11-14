import * as ImagePicker from "expo-image-picker"

/* Proporción de libro (ancho:alto): la misma que usan la ficha y las tarjetas del Home */
const COVER_ASPECT: [number, number] = [2, 3]
const PICKER_QUALITY = 0.8

/**
 * Abre la galería para elegir la portada, con un recorte en proporción de libro.
 * NOTE: el recorte con proporción fija solo lo respeta Android; en iOS el recorte es libre
 * @returns string | null : ruta local de la imagen elegida, o null si se canceló
 */
export const pickCoverImage = async (): Promise<string | null> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: COVER_ASPECT,
    quality: PICKER_QUALITY,
  })

  if (result.canceled || !result.assets[0]?.uri) return null
  return result.assets[0].uri
}