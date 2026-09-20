import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const RootLayout = () => {
    return(
        <Tabs
            screenOptions={{
                /*
                TODO: Falta colocar los colores correctos en la navbar, usando las constantes de theme.ts
                */
                tabBarActiveTintColor: '#e91e63',
            }}>
            <Tabs.Screen
                name="Index"
                options={{
                    title : 'Inicio',
                    tabBarIcon: ({ color, focused}) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ExploreScreen"
                options={{
                    title : 'Explorar',
                    tabBarIcon: ({ color, focused}) => (
                        <Ionicons name={focused ? 'compass' : 'compass-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Editor"
                options={{
                    title : 'Editor',
                    tabBarIcon: ({ color, focused}) => (
                        <MaterialCommunityIcons name={focused ? 'note-edit' : 'note-edit-outline'} color={color} size={24} />
                    ),
                }} />
            <Tabs.Screen
                name="ProfileScreen"
                options={{
                    title : 'Perfil',
                    tabBarIcon: ({ color, focused}) => (
                        <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} color={color} size={24} />
                    ),
                }} />
            <Tabs.Screen
                name="Maps"
                options={{
                    href : null
                }} />
        </Tabs>
    )
}

export default RootLayout