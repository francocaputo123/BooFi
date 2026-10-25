import { SafeAreaView } from "react-native-safe-area-context"
import { View, StyleSheet, Text, Image, Pressable } from "react-native"
import { useRouter } from "expo-router"

// constants
import { COLORS, SPACING } from "@/constants/theme"

// data
import profileData from "@/data/profileData.json"

// icons
import { Ionicons } from "@expo/vector-icons"

// store
import authStore from "@/store/authStore"

// firebase
import { destroyAuth } from '@/services/authService'

const Profile = () => {
    const router = useRouter()

    const loggout = authStore((state) => state.loggout)
    const profilePhoto = authStore((state) => state.photoUrl)

    const actions = {
        loggout: async () => {
            loggout()
            await destroyAuth()
            router.replace('/(auth)/Auth')
        },
        handleMyData: () => {
            router.push('/profile/ProfileData')
        },
        handleMyBooks: () => {
            router.push('/profile/ProfileBooks')
        }
    }

    return (
        <View style={styles.screenBackground}>
            <SafeAreaView style={styles.container}>
                {/* Avatar con botón flotante de cámara */}
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

                {/* Lista de Acciones / Menú */}
                <View style={styles.buttonContainer}>
                    {profileData.buttons.map((btn) => {
                        const actionFn = actions[btn.action as keyof typeof actions]

                        if (btn.type === "button") {
                            return (
                                <Pressable
                                    key={btn.label}
                                    onPress={actionFn}
                                    style={({ pressed }) => [
                                        styles.btn,
                                        pressed && styles.btnPressed
                                    ]}
                                >
                                    <Text style={styles.btnText}>{btn.label}</Text>
                                    <Ionicons 
                                        name="chevron-forward" 
                                        size={20} 
                                        color={COLORS.surface || '#333'} 
                                    />
                                </Pressable>
                            )
                        }

                        return (
                            <Pressable
                                key={btn.label}
                                style={({ pressed }) => [
                                    styles.logoutBtn,
                                    pressed && styles.btnPressed
                                ]}
                                onPress={actionFn}
                            >
                                <Ionicons 
                                    name="log-out-outline" 
                                    size={20} 
                                    color="#E53935" 
                                    style={styles.logoutIcon}
                                />
                                <Text style={styles.logoutText}>
                                    {btn.label}
                                </Text>
                            </Pressable>
                        ) 
                    })}
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    screenBackground: {
        flex: 1,
        backgroundColor: COLORS.background || '#F8F9FA',
    },
    container: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: SPACING.m || 16,
        paddingTop: SPACING.l || 24,
    },

    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.l || 24,
    },
    profileImage: {
        width: 130,
        height: 130,
        borderRadius: 65, 
        borderWidth: 3,
        borderColor: COLORS.primary || '#007AFF',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: COLORS.primary || '#007AFF',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },

    buttonContainer: {
        width: '100%',
        paddingHorizontal: SPACING.s || 8,
    },

    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m || 16,
        paddingHorizontal: SPACING.m || 16,
        borderRadius: 14,
        marginVertical: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    btnText: {
        color: COLORS.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    
    btnPressed: {
        opacity: 0.75,
        transform: [{ scale: 0.99 }],
    },

    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#FFEBEE',
        paddingVertical: SPACING.m || 14,
        borderRadius: 14,
        marginTop: SPACING.l || 24,
    },
    logoutText: {
        color: '#E53935',
        fontWeight: "700",
        fontSize: 16,
    },
    logoutIcon: {
        marginRight: SPACING.xs || 8,
    } 
})

export default Profile