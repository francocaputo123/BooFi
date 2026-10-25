import { Stack } from "expo-router"
import { COLORS } from "@/constants/theme"

/**
 * NOTE: el Stack propio de esta sección existe para que sus pantallas tengan header y botón de volver,
 * porque el layout raíz oculta los headers.
 */
const WriteLayout = () => (
  <Stack
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.background },
      headerTintColor: COLORS.text,
      headerBackTitle: "Volver",
    }}
  >
    <Stack.Screen name="[draftId]/index" options={{ title: "Capítulos" }} />
    <Stack.Screen name="[draftId]/[chapterId]" options={{ title: "Editor" }} />
    <Stack.Screen name="[draftId]/settings" options={{ title: "Configuración" }} />
  </Stack>
)

export default WriteLayout