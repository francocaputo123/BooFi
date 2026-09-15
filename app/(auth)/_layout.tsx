import { Stack } from "expo-router";

const AuthLayout = () => {
    return(
        <Stack>
            <Stack.Screen name="auth" options={{ headerShown : false}}/>
        </Stack>
    )
}

export default AuthLayout