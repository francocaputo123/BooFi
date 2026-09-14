import { Tabs } from "expo-router"

const RootLayout = () => {
    return(
        <Tabs>
            <Tabs.Screen name="index" options={{ title : 'Home'}} />
        </Tabs>
    )
}

export default RootLayout