import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, Alert, Linking, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker'

// constants
import { COLORS } from '@/constants/theme';

// data
import profileCameraData from '@/data/profileCameraData.json';

const ProfileCamera = () => {
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isOpen, setIsOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const actions = {
    handleCameraFacing: () => {
      setFacing((current) => (current === 'back' ? 'front' : 'back'));
    },

    handleTakePicture: async () => {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync();
          const res = await fetch(photo?.uri)
          const blob = await res.blob()
          console.log('Foto tomada:', blob);
        } catch (error) {
          console.error('Error al tomar la foto:', error);
        }
      }
    },

    handleOpenCamera : async () => {
      if (permission?.granted) {
        setIsOpen(true);
        return;
      }

      const response = await requestPermission();

      if (response.granted) {
        setIsOpen(true);
      } else if (!response.canAskAgain) {
        Alert.alert(
          'Permiso requerido',
          'Habilita el acceso a la cámara desde los ajustes de tu dispositivo para tomar la foto.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
          ]
        )
      }
    },

    handlePickImage : async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      })

      if (!result.canceled) {
        console.log(result);
      } else {
        Alert.alert(
          'Perfil',
          'No seleccionaste ninguna imagen',
          [
            { text: 'Cerrar', style: 'cancel' }
          ]
        )
      }
    }

  }

  return (
    <View style={styles.container}>
      {isOpen ? (
        <View style={styles.cameraContainer}>
          <CameraView style={StyleSheet.absoluteFillObject} facing={facing} ref={cameraRef} />
          <View style={styles.buttonContainer}>
            {profileCameraData.active.map((btn, i) => {
              return (
                <TouchableOpacity
                  key={i}
                  style={styles[btn.styles as keyof typeof styles] as ViewStyle}
                  onPress={actions[btn.action as keyof typeof actions]}
                >
                  <Ionicons name={btn.icon as any} size={30} color="white" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : (
        <SafeAreaView style={styles.safeAreaContainer}>
          <View>
            <Text style={styles.message}>Elije tu imagen de perfil</Text>
            {
              profileCameraData.notActive.map((btn, i) => {
                return(
                  <Pressable 
                  key={i}
                  onPress={actions[btn.action as keyof typeof actions]} 
                  style={styles[btn.styles as keyof typeof styles] as ViewStyle}
                  >
                    <Text style={styles[btn.text.styles as keyof typeof styles] as TextStyle}>
                      {btn.text.label}
                    </Text>
                  </Pressable>
                )
              })
            }
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeAreaContainer: {
    width: '80%',
  },
  btn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  btnText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  pictureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileCamera;