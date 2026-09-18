import { Stack } from "expo-router";

const RootLayout = () => {

    const isAuthenticated = false

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