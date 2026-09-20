import { Stack } from "expo-router";
import authStore from "@/store/authStore";

const RootLayout = () => {

    const isAuthenticated = authStore((state) => state.isAuthenticated)

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="(auth)" />
            ) : (
                <Stack.Screen name="(tabs)" />
            )}
        </Stack>
    );
}

export default RootLayout