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
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// constants
import { COLORS, SPACING } from '@/constants/theme';

// data
import profileCameraData from '@/data/profileCameraData.json';

// controller
import { uploadImage } from '@/services/profileService';

// store
import authStore from '@/store/authStore';

// icons
import Ionicons from '@expo/vector-icons/Ionicons';

// utils
import { handleImageVerification } from '@/utils/handleVerification';

interface ResolutionOption {
  label: string;
  value: number | null;
  description: string;
  tag?: string;
}

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  {
    label: "480 px (Baja)",
    value: 480,
    description: "Muy ligera (~100 - 200 KB).",
  },
  {
    label: "720 px (Media)",
    value: 720,
    description: "Recomendada (~300 - 500 KB). ",
    tag: "Recomendada",
  },
  {
    label: "1080 px (Alta)",
    value: 1080,
    description: "Alta definición (~700 - 900 KB).",
  },
  {
    label: "Original",
    value: null,
    description: "Sin redimensionar",
  },
];

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
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<number | null>(720);

  const processAndUploadBlob = async (blob: Blob) => {
    try {
      setLoading(true);
      const verified = handleImageVerification(blob);

      if (verified?.status === "error") {
        Alert.alert(
          'Foto superior a 1 MB',
          'La imagen supera el límite de 1 MB. Cambia la resolución a 720px o 480px desde la configuración de la cámara para reducir su peso.',
          [{ text: 'Entendido', style: 'cancel' }]
        );
        return;
      }

      const image = await uploadImage(blob);

      if (image) {
        setPhoto({ photoUrl: image });
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error al subir imagen', error?.message || 'Ocurrió un error inesperado');
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
          setLoading(true);
          const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
          if (!photo?.uri) return;

          let finalUri = photo.uri;

          // Redimensionamos la imagen en píxeles según la configuración de la cámara
          if (selectedResolution) {
            try {
              const manipulated = await manipulateAsync(
                photo.uri,
                [{ resize: { width: selectedResolution } }],
                { compress: 0.85, format: SaveFormat.JPEG }
              );
              finalUri = manipulated.uri;
            } catch (err) {
              console.warn("[ProfileCamera] No se pudo redimensionar la captura:", err);
            }
          }

          const res = await fetch(finalUri);
          const blob = await res.blob();
          await processAndUploadBlob(blob);
        } catch (error) {
          console.error("[ProfileCamera] Error al capturar foto:", error);
        } finally {
          setLoading(false);
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
          setLoading(true);
          let finalUri = photo.assets[0].uri;

          if (selectedResolution) {
            try {
              const manipulated = await manipulateAsync(
                finalUri,
                [{ resize: { width: selectedResolution } }],
                { compress: 0.85, format: SaveFormat.JPEG }
              );
              finalUri = manipulated.uri;
            } catch (err) {
              console.warn("[ProfileCamera] Error al redimensionar foto seleccionada:", err);
            }
          }

          const res = await fetch(finalUri);
          const blob = await res.blob();
          await processAndUploadBlob(blob);
        } catch (error) {
          console.error("[ProfileCamera] Error al procesar imagen de galería:", error);
        } finally {
          setLoading(false);
        }
      } else {
        Alert.alert(
          'Perfil',
          'No seleccionaste ninguna imagen',
          [{ text: 'Cerrar', style: 'cancel' }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      {isOpen ? (
        <View style={styles.cameraContainer}>
          <CameraView style={StyleSheet.absoluteFillObject} facing={facing} ref={cameraRef} />

          {/* Cabecera con Configuración de Peso/Resolución y Botón Cerrar */}
          <SafeAreaView style={styles.cameraHeader}>
            <TouchableOpacity
              style={styles.configButton}
              onPress={() => setConfigModalVisible(true)}
            >
              <Ionicons name="options-outline" size={18} color="white" />
              <Text style={styles.configButtonText}>
                {selectedResolution ? `${selectedResolution}px` : "Original"}
              </Text>
            </TouchableOpacity>

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

      {/* Modal para ver imagen ampliada */}
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

      {/* Modal de Configuración de Peso / Resolución en píxeles */}
      <Modal visible={configModalVisible} transparent animationType="fade">
        <View style={styles.configModalOverlay}>
          <View style={styles.configModalCard}>
            <View style={styles.configModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="camera-outline" size={22} color={COLORS.primary || '#007AFF'} />
                <Text style={styles.configModalTitle}>Ajustar peso de imagen</Text>
              </View>
              <TouchableOpacity onPress={() => setConfigModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.configModalSubtitle}>
              Modifica la resolución en píxeles para controlar el peso final del archivo. La app requiere que la foto no supere 1 MB.
            </Text>

            {RESOLUTION_OPTIONS.map((item) => {
              const isSelected = selectedResolution === item.value;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.resOption, isSelected && styles.resOptionSelected]}
                  onPress={() => {
                    setSelectedResolution(item.value);
                    setConfigModalVisible(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.resOptionTitle, isSelected && styles.resOptionTitleSelected]}>
                        {item.label}
                      </Text>
                      {item.tag ? (
                        <View style={styles.resTag}>
                          <Text style={styles.resTagText}>{item.tag}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.resOptionDesc}>{item.description}</Text>
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.primary || '#007AFF'} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={20} color="#CCCCCC" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
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

  cameraContainer: {
    flex: 1,
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
    backgroundColor: COLORS.surface || '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  message: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text || '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },

  btn: {
    backgroundColor: COLORS.primary || '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  cameraHeader: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },

  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },

  configButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  closeCameraButton: {
    padding: 4,
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
  },

  /* Modal Configuración de Resolución */
  configModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  configModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  configModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  configModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  configModalSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 16,
  },

  resOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },

  resOptionSelected: {
    borderColor: COLORS.primary || '#007AFF',
    backgroundColor: '#F0F6FF',
  },

  resOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  resOptionTitleSelected: {
    color: COLORS.primary || '#007AFF',
  },

  resOptionDesc: {
    fontSize: 12,
    color: '#777777',
    marginTop: 2,
  },

  resTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  resTagText: {
    color: '#1976D2',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default ProfileCamera;
