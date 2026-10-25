import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { 
  Pressable, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert, 
  Linking, 
  ViewStyle, 
  TextStyle, 
  Image,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// constants
import { COLORS, SPACING } from '@/constants/theme';

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
  const setPhoto = authStore((state) => state.setPhoto);
  const profilePhoto = authStore((state) => state.photoUrl);
  
  const router = useRouter();

  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isOpen, setIsOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [expand, setExpand] = useState(false);
  const [loading, setLoading] = useState(false);

  const processAndUploadBlob = async (blob: Blob) => {
    try {
      setLoading(true);
      const verified = handleImageVerification(blob);

      if (verified?.status === "error") {
        router.back();
        Alert.alert('Error en la camara', verified?.message, [{ text: 'Cerrar', style: 'cancel' }]);
        return;
      }
      
      const image = await uploadImage(blob);

      /**
- Importante actualizar la store.
       */
      if (image) {
        setPhoto({ photoUrl: image });
        router.back();
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const actions = {
    handleCameraFacing: () => {
      setFacing((current) => (current === 'back' ? 'front' : 'back'));
    },

    handleTakePicture: async () => {
      if (cameraRef.current && !loading) {
        try {
          /** 
            Se convierte en un blob para pasarlo a firebase
          */
          const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
          if (!photo?.uri) return;

          const res = await fetch(photo.uri);
          const blob = await res.blob();

          await processAndUploadBlob(blob);
        } catch (error) {
          throw error;
        }
      }
    },

    handleOpenCamera: async () => {
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
        );
      }
    },

    handlePickImage: async () => {
      const photo = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!photo.canceled && photo.assets[0]?.uri) {
        try {
          const res = await fetch(photo.assets[0].uri);
          const blob = await res.blob();
          await processAndUploadBlob(blob);
        } catch (error) {
          
        }
      } else {
        Alert.alert(
          'Perfil',
          'No seleccionaste ninguna imagen',
          [
            { text: 'Cerrar', style: 'cancel' }
          ]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      {isOpen ? (
        <View style={styles.cameraContainer}>
          <CameraView style={StyleSheet.absoluteFillObject} facing={facing} ref={cameraRef} />
          
          <SafeAreaView style={styles.cameraHeader}>
            <TouchableOpacity 
              style={styles.closeCameraButton}
              onPress={() => setIsOpen(false)}
            >
              <Ionicons name="close-circle" size={38} color="white" />
            </TouchableOpacity>
          </SafeAreaView>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary || '#007AFF'} />
            </View>
          )}

          <View style={styles.buttonContainer}>
            {profileCameraData.active.map((btn, i) => {
              return (
                <TouchableOpacity
                  key={i}
                  disabled={loading}
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

          <View style={styles.imageSection}>
            <Pressable
              style={({ pressed }) => [
                styles.imageBtn,
                pressed && { opacity: 0.9 }
              ]}
              onPress={() => setExpand(true)}
            >
              <Image 
                style={styles.profileImage}
                accessibilityLabel="Foto de perfil"
                source={profilePhoto ? { uri: profilePhoto } : require('@/assets/images/default_profile.png')}
              />
              <View style={styles.zoomHint}>
                <Ionicons name="search-outline" size={16} color="white" />
                <Text style={styles.zoomText}>Tocar para ampliar</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.actionsCard}>
            <Text style={styles.message}>Elije tu imagen de perfil</Text>
            
            {loading ? (
              <ActivityIndicator color={COLORS.primary || '#007AFF'} style={{ marginVertical: 20 }} />
            ) : (
              profileCameraData.notActive.map((btn, i) => {
                return (
                  <Pressable 
                    key={i}
                    onPress={actions[btn.action as keyof typeof actions]} 
                    style={({ pressed }) => [
                      styles[btn.styles as keyof typeof styles] as ViewStyle,
                      pressed && styles.btnPressed
                    ]}
                  >
                    <Text style={styles[btn.text.styles as keyof typeof styles] as TextStyle}>
                      {btn.text.label}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>
        </SafeAreaView>
      )}

      <Modal visible={expand} transparent animationType="fade">
        <View style={styles.overlayContainer}>
          <TouchableOpacity 
            style={styles.closeOverlayBtn} 
            onPress={() => setExpand(false)}
          >
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>
          <Image
            style={styles.overlayImage}
            accessibilityLabel="Foto de perfil ampliada"
            source={profilePhoto ? { uri: profilePhoto } : require('@/assets/images/default_profile.png')}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
  },

  safeAreaContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: SPACING?.m || 16,
  },

  backButton: {
    padding: 4,
  },

  imageSection: {
    alignItems: 'center',
    marginVertical: 24,
  },

  imageBtn: {
    alignItems: 'center',
    position: 'relative',
  },

  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100, 
    borderWidth: 4,
    borderColor: COLORS.primary || '#007AFF',
  },

  zoomHint: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  zoomText: {
    color: 'white',
    fontSize: 12,
  },

  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  message: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 16,
  },

  btn: {
    backgroundColor: COLORS.primary || '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },

  btnPressed: {
    opacity: 0.8,
  },

  btnText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },

  cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  cameraHeader: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 20,
  },

  closeCameraButton: {
    padding: 8,
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    zIndex: 10,
  },

  pictureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  flipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },

  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeOverlayBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },

  overlayImage: {
    width: 320,
    height: 320,
    borderRadius: 160, 
    borderWidth: 2,
    borderColor: COLORS.primary || '#007AFF',
  }
});

export default ProfileCamera