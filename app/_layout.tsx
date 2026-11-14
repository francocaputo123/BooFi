import { useCallback, useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

//constantes
import { COLORS } from "@/constants/theme";

//store
import authStore from "@/store/authStore";

//hooks
import useAuthHydrated from "@/hooks/useAuthHydrated";

//components
import AnimatedSplash from "@/components/AnimatedSplash";

// Mantiene visible el splash nativo hasta que nuestro splash animado ya esté dibujado
// (así no hay un destello en blanco). Se oculta más abajo, en hideNativeSplash.
SplashScreen.preventAutoHideAsync().catch(() => {});

const RootLayout = () => {

    const isAuthenticated = authStore((state) => state.isAuthenticated)

    // true cuando zustand ya leyó la sesión guardada
    const hydrated = useAuthHydrated()

    const [showSplash, setShowSplash] = useState(true)

    // Mientras se ve el splash, el botón "atrás" de Android no hace nada
    useEffect(() => {
        if (!showSplash) return;

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => true)
        return () => subscription.remove()
    }, [showSplash])

    const hideNativeSplash = useCallback(() => {
        SplashScreen.hideAsync().catch(() => {})
    }, [])

    const handleSplashFinish = useCallback(() => {
        setShowSplash(false)
    }, [])

    return (
        <View style={styles.root}>
            <Stack screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="(auth)" />
                ) : (
                    <Stack.Screen name="(tabs)" />
                )}
            </Stack>

            {showSplash && (
                <View style={StyleSheet.absoluteFill} onLayout={hideNativeSplash}>
                    <AnimatedSplash ready={hydrated} onFinish={handleSplashFinish} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
})

export default RootLayout
