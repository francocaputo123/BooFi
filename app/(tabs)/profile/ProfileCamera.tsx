import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, Alert, Linking, ViewStyle, TextStyle, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'

// constants
import { COLORS } from '@/constants/theme';

// data
import profileCameraData from '@/data/profileCameraData.json';

//controller
import { uploadImage } from '@/services/profileService';

//store
import authStore from '@/store/authStore';

//icons
import Ionicons from '@expo/vector-icons/Ionicons';

//utils
import { handleImageVerification } from '@/utils/handleVerification';

const ProfileCamera = () => {
  
  const setPhoto = authStore((state) => state.setPhoto) 
  const profilePhoto = authStore((state) => state.photoUrl)
  
  const router = useRouter();

  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isOpen, setIsOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [expand, setExpand] = useState(false)

  const actions = {
    handleCameraFacing: () => {
      setFacing((current) => (current === 'back' ? 'front' : 'back'));
    },

    handleTakePicture: async () => {
      if (cameraRef.current) {
        try {
          /** 
            Se convierte en un blob para pasarlo a firebase
          */

          const photo = await cameraRef.current.takePictureAsync()
          const res = await fetch(photo?.uri)
          const blob = await res.blob()

          const verified = handleImageVerification(blob)

          if(verified?.status == "error") {
            router.back()
            return(
              Alert.alert(
                'Error en la camara',
                verified?.message,
                [
                  { text: 'Cerrar', style: 'cancel' },
                ]
              )
            )
          }
          
          const image = await uploadImage(blob) 

          /**
           * Importante actualizar la store.
           */

          if(image) {
            setPhoto({
              photoUrl : image
            })
            router.back()
          }

        } catch (error) {
          throw error
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
      const photo = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      })

      if (!photo.canceled) {
        try {
          const res = await fetch(photo?.assets[0].uri)
          const blob = await res.blob() 

          const verified = handleImageVerification(blob)

          if(verified?.status == "error") {
            router.back()
            return(
              Alert.alert(
                'Error en la camara',
                verified?.message,
                [
                  { text: 'Cerrar', style: 'cancel' },
                ]
              )
            )
          }

          const image = await uploadImage(blob)

          if(image) {
            setPhoto({
              photoUrl : image
            })
            router.back()
          }

        } catch (error) {
          
        }
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
          <Pressable
          style={styles.imageBtn}
          onPress={() => setExpand(true)}
          >
            <Image 
            style={styles.profileImage}
            alt="Foto de perfil"
            source={profilePhoto ? { uri : profilePhoto } : require('@/assets/images/default_profile.png')}
            />
          </Pressable>
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
      {
        expand && (
          <View
          style={styles.overlayContainer}
          >
            <Image
            style={styles.overlayImage}
            alt="Foto de perfil"
            source={profilePhoto ? { uri : profilePhoto } : require('@/assets/images/default_profile.png')}
            />
            <TouchableOpacity
                  onPress={() => setExpand(false)}
                >
                  <Ionicons name="close" size={60} color="red" />
                </TouchableOpacity>
          </View>
        )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  profileImage : {
    width: 250,
    height: 250,
    borderRadius: 150, 
    borderWidth: 2,
    borderColor: COLORS.primary,
    resizeMode: 'cover',
  },

  imageBtn: {
    alignItems : 'center',
    marginVertical : 10
  },

  overlayContainer : {
    position : 'absolute',
    backgroundColor : 'rgb(0, 0, 0, 0.7)',
    width : '100%',
    height : '100%',
    zIndex : 100,
    alignItems : 'center',
    paddingVertical : 30
  },

  overlayImage : {
    width: 350,
    height: 350,
    borderRadius: 200, 
    borderWidth: 2,
    borderColor: COLORS.primary,
    resizeMode: 'cover',
  }
});

export default ProfileCamera;