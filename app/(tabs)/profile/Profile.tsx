import { SafeAreaView } from "react-native-safe-area-context"
import { View, StyleSheet, Text, Image, Pressable, Alert, ActivityIndicator, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { useState } from "react"

// constants
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

// data
import profileData from "@/data/profileData.json"

// icons
import { Ionicons } from "@expo/vector-icons"

// store
import authStore from "@/store/authStore"

// firebase
import { destroyAuth, deleteUserAccount } from '@/services/authService'

const Profile = () => {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const loggout = authStore((state) => state.loggout)
    const profilePhoto = authStore((state) => state.photoUrl)
    const username = authStore((state) => state.username)
    const email = authStore((state) => state.email)
    const bio = authStore((state) => state.bio)

    const actions = {
        loggout: async () => {
            try {
                await destroyAuth()
            } catch (err) {
                console.warn("[Profile] Error al cerrar sesión en Firebase:", err)
            } finally {
                loggout()
                router.replace('/(auth)/Auth')
            }
        },
        handleMyData: () => {
            router.push('/profile/ProfileData')
        },
        handleMyBooks: () => {
            router.push('/profile/ProfileBooks')
        },
        handleMyEarnings: () => {
            router.push('/profile/ProfileEarnings')
        },
        handleDeleteAccount: () => {
            Alert.alert(
                "Eliminar cuenta",
                "¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Se borrarán tus datos de perfil y acceso, pero se conservarán los libros que hayas publicado.",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Eliminar definitivamente",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                setIsDeleting(true)
                                await deleteUserAccount()
                                loggout()
                                Alert.alert("Cuenta eliminada", "Tu cuenta ha sido eliminada con éxito.")
                                router.replace('/(auth)/Auth')
                            } catch (error: any) {
                                Alert.alert(
                                    "Error al eliminar cuenta",
                                    error?.message || "Ocurrió un error al intentar eliminar la cuenta."
                                )
                            } finally {
                                setIsDeleting(false)
                            }
                        }
                    }
                ]
            )
        }
    }

    return (
        <View style={styles.screenBackground}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Tarjeta de cabecera con Avatar e información */}
                    <View style={styles.headerCard}>
                        <Pressable
                            onPress={() => router.push("/profile/ProfileCamera")}
                            style={({ pressed }) => [
                                styles.avatarContainer,
                                pressed && { opacity: 0.85 }
                            ]}
                        >
                            <Image 
                                style={styles.profileImage}
                                accessibilityLabel="Foto de perfil"
                                source={
                                    profilePhoto 
                                        ? { uri: profilePhoto } 
                                        : require('@/assets/images/default_profile.png')
                                }
                            />
                            <View style={styles.cameraBadge}>
                                <Ionicons name="camera" size={16} color="white" />
                            </View>
                        </Pressable>

                        <Text style={styles.usernameText}>
                            {username ? `@${username}` : "Usuario"}
                        </Text>
                        {email ? (
                            <Text style={styles.emailText}>{email}</Text>
                        ) : null}
                        {bio ? (
                            <Text style={styles.bioText} numberOfLines={3}>{bio}</Text>
                        ) : null}
                    </View>

                    {/* Menú de navegación principal */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>MI BIBLIOTECA Y DATOS</Text>
                        {profileData.buttons
                            .filter((btn) => btn.type === "button")
                            .map((btn) => {
                                const actionFn = actions[btn.action as keyof typeof actions]
                                return (
                                    <Pressable
                                        key={btn.label}
                                        onPress={actionFn}
                                        style={({ pressed }) => [
                                            styles.menuCard,
                                            pressed && styles.cardPressed
                                        ]}
                                    >
                                        <View style={styles.menuIconContainer}>
                                            <Ionicons 
                                                name={(btn.icon as any) || "folder-outline"} 
                                                size={22} 
                                                color={COLORS.primary || "#007AFF"} 
                                            />
                                        </View>
                                        <View style={styles.menuTextContainer}>
                                            <Text style={styles.menuTitle}>{btn.label}</Text>
                                            {"description" in btn && btn.description ? (
                                                <Text style={styles.menuDescription}>{btn.description}</Text>
                                            ) : null}
                                        </View>
                                        <Ionicons 
                                            name="chevron-forward" 
                                            size={20} 
                                            color="#9E9E9E" 
                                        />
                                    </Pressable>
                                )
                            })}
                    </View>

                    {/* Acciones de cuenta */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>CUENTA</Text>
                        
                        {/* Botón Cerrar Sesión */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.actionBtn,
                                pressed && styles.cardPressed
                            ]}
                            onPress={actions.loggout}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: '#F0F0F0' }]}>
                                <Ionicons name="log-out-outline" size={20} color="#555" />
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.actionBtnText}>Cerrar sesión</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#BBB" />
                        </Pressable>

                        {/* Botón Borrar Cuenta */}
                        <Pressable
                            disabled={isDeleting}
                            style={({ pressed }) => [
                                styles.deleteBtn,
                                pressed && styles.cardPressed
                            ]}
                            onPress={actions.handleDeleteAccount}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
                                <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.deleteBtnText}>Eliminar cuenta</Text>
                                <Text style={styles.deleteBtnSubtext}>Borra tu perfil pero conserva tus libros publicados</Text>
                            </View>
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#D32F2F" />
                            ) : (
                                <Ionicons name="chevron-forward" size={18} color="#D32F2F" />
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Overlay de carga al eliminar */}
            {isDeleting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#D32F2F" />
                    <Text style={styles.loadingText}>Eliminando cuenta...</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    screenBackground: {
        flex: 1,
        backgroundColor: COLORS.background || '#F8F9FA',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.m || 16,
        paddingTop: SPACING.m || 16,
        paddingBottom: SPACING.xl || 32,
    },

    headerCard: {
        alignItems: "center",
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 24,
        paddingHorizontal: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55, 
        borderWidth: 3,
        borderColor: COLORS.primary || '#007AFF',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: COLORS.primary || '#007AFF',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
    },
    usernameText: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text || '#1A1A1A',
        marginBottom: 4,
    },
    emailText: {
        fontSize: 14,
        color: '#777777',
        marginBottom: 6,
    },
    bioText: {
        fontSize: 13,
        color: '#555555',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 4,
        paddingHorizontal: 16,
    },

    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        letterSpacing: 0.8,
        marginBottom: 10,
        marginLeft: 4,
    },

    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#E8F1FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text || '#1A1A1A',
    },
    menuDescription: {
        fontSize: 12,
        color: '#888888',
        marginTop: 2,
    },
    cardPressed: {
        opacity: 0.75,
        transform: [{ scale: 0.99 }],
    },

    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    actionBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333333',
    },

    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F8',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    deleteBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#D32F2F',
    },
    deleteBtnSubtext: {
        fontSize: 11,
        color: '#E57373',
        marginTop: 2,
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingText: {
        marginTop: 12,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
})

export default Profile
