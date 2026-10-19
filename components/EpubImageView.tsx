import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { COLORS, SPACING } from "@/constants/theme";
import { EpubImageViewProps } from "@/types/reading.types";

/**
 * Imagen de un capitulo. Ocupa el ancho disponible (sin pasarse de su tamaño real, para que un
 * icono chico no se estire) y reserva su alto de antemano, asi el texto no salta cuando carga.
 * Si el epub no dejo medidas, las pide recien al abrir la imagen.
 */
const EpubImageView = ({ uri, width, height, alt }: EpubImageViewProps) => {
    const [size, setSize] = useState(width && height ? { width, height } : null)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        if (size) return
        let isActive = true

        Image.getSize(
            uri,
            (loadedWidth, loadedHeight) => {
                if (isActive && loadedWidth > 0 && loadedHeight > 0) {
                    setSize({ width: loadedWidth, height: loadedHeight })
                }
            },
            () => {
                if (isActive) setHasError(true)
            }
        )
        return () => {
            isActive = false
        }
    }, [uri, size])

    if (hasError) return null

    return (
        <View style={styles.container}>
            <Image
                source={{ uri }}
                style={[
                    styles.image,
                    size ? { aspectRatio: size.width / size.height, maxWidth: size.width } : styles.placeholder,
                ]}
                resizeMode="contain"
                accessibilityLabel={alt}
                onError={() => setHasError(true)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginVertical: SPACING.m,
    },
    image: {
        width: "100%",
    },
    // Mientras no se conocen las medidas: un alto fijo evita que la imagen mida 0
    placeholder: {
        height: 200,
        backgroundColor: COLORS.surface,
    },
})

export default EpubImageView