import { Stack } from 'expo-router'

const ProfileLayout = () => {
  return (
    <Stack>
      <Stack.Screen 
        name="Profile" 
        options={{
          title : 'Mi Perfil', 
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="ProfileData" 
        options={{ 
          title: 'Mis datos',
          headerShown: true, 
        }} 
      />
      <Stack.Screen 
        name="ProfileCamera" 
        options={{ 
          title: 'Cámara',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="ProfileBooks" 
        options={{ 
          title: 'Mis libros',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="ProfilePassword" 
        options={{ 
          title: 'Contraseña',
          headerShown: true,
        }} 
      />
    </Stack>
  )
}

export default ProfileLayout