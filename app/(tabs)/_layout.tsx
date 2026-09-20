import { Tabs } from "expo-router"

const RootLayout = () => {
    return(
        <Tabs>
            <Tabs.Screen name="Index" options={{ title : 'Home'}} />
        </Tabs>
    )
}

export default RootLayout