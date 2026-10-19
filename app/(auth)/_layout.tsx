import { Stack } from "expo-router";

const AuthLayout = () => {
    return(
        <Stack>
            <Stack.Screen name="Auth" options={{ headerShown : false}}/>
            <Stack.Screen name="PasswordRecovery" options={{ headerShown : false}}/>
        </Stack>
    )
}

export default AuthLayout