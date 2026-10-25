import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// constants
import { SPACING, COLORS } from '@/constants/theme';

//data
import profile from '@/data/profile.json'

//icons
import { Ionicons } from '@expo/vector-icons';

//store
import authStore from '@/store/authStore';
import { useShallow } from 'zustand/react/shallow'

//components
import Modal from '@/components/Modal';

//types 
import { ProfileKey } from '@/types/profile.types';

//services
import { updateUsername, updateBio } from '@/services/profileService';

const ProfileData = () => {

    const router = useRouter()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [change, setChange] = useState("")
    const [fieldText, setFieldText] = useState("")
    const [currentField, setCurrentField] = useState<ProfileKey | null>(null)
    const [isFocused, setIsFocused] = useState(false)
    
    const setAuthData = authStore((state) => state.setAuthData)

    const userData = authStore(
        useShallow((state) => ({
            email : state.email,
            username : state.username,
            bio : state.bio,
        }))
    )

    const fieldTitles : Record<ProfileKey, string> = {
        username : "Actualizar nombre de usuario",
        bio : "Actualizar biografia"
    }

    const actions = {
        updateUsername : () => handleOpenModal('username'),
        updateBio : () => handleOpenModal('bio'),
        updatePassword : () => router.push('/profile/ProfilePassword')
    }

    const handleOpenModal = (fieldKey : ProfileKey) => {
        setCurrentField(fieldKey)
        setFieldText(fieldTitles[fieldKey] || "Actualizar")
        setChange(userData[fieldKey] || "")
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if(!currentField) return 

        switch(currentField) {
            case 'username' : {
                const response = await updateUsername(change)

                if(response) {

                    setAuthData({
                        [currentField] : change
                    })
                    
                    setIsModalOpen(false)
                    return
                }
                break
            }
            case 'bio' : {
                const response = await updateBio(change)

                if(response) {

                    setAuthData({
                        [currentField] : change
                    })
                    
                    setIsModalOpen(false)
                    return
                }
                break
            }
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.infoContainer}>
                    <Text style={styles.title}>Informacion personal</Text>
                    {
                        profile.top.map((field, i) => {
                            return(
                                <Pressable
                                key={field.text}
                                onPress={actions[field.action as keyof typeof actions]}
                                style={({ pressed }) => [
                                    styles.rowContainer, 
                                    pressed && styles.btnPressed 
                                ]}
                            >
                                <Ionicons name={field.icon as any} size={24} color={COLORS.secondary || "black"} />
                                <View style={styles.textWrapper}>
                                    <Text style={styles.rowTitle}>{field.label}</Text>
                                    <Text style={styles.rowLabel}>
                                        {
                                            field.type == "text" ? (
                                                userData[field.key as keyof typeof userData]
                                            ) : (
                                                field.text
                                            )
                                        }
                                    </Text>
                                </View>
                                <Ionicons name="arrow-forward" size={24} color={COLORS.primary || "black"} />
                            </Pressable>
                            )
                        })
                    }

                    <Text style={styles.title}>Datos de cuenta</Text>
                    {
                        profile.bottom.map((field, i) => {
                            return(
                                <Pressable
                                    key={field.text}
                                    onPress={actions[field.action as keyof typeof actions]}
                                    style={({ pressed }) => [
                                        styles.rowContainer,
                                        pressed && styles.btnPressed
                                    ]}
                                >
                                    <Ionicons name={field.icon as any} size={24} color={COLORS.secondary || "black"} />
                                    <View style={styles.textWrapper}>
                                        <Text style={styles.rowTitle}>{field.label}</Text>
                                        <Text style={styles.rowLabel}>{field.text}</Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={24} color={COLORS.primary || "black"} />
                                </Pressable>
                            )
                        })
                    }
                </View>
            </ScrollView>
            <Modal
                innerStyle={styles.innerModal}
                isOpen={isModalOpen}
                setOpen={setIsModalOpen}
            >
                <Text style={styles.titleIpt}>{fieldText}</Text>
                
                <TextInput
                value={change}
                onChangeText={setChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={[
                styles.ipt,
                isFocused && styles.iptFocused
                ]}
                placeholder="Escribe el nuevo valor..."
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4} 
                textAlignVertical="top" 
                />

                <Pressable
                    style={styles.modalBtn}
                    onPress={handleSave}
                >
                    <Text style={styles.modalBtnText}>
                        Guardar cambios
                    </Text>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING?.l || 16,
        paddingVertical: SPACING?.m || 12,
    },

    rowContainer: {
        backgroundColor: COLORS.surface || '#ffffff',
        borderRadius: 10,
        padding: 12,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING?.xs || 4,
    },

    textWrapper: {
        flex: 1, 
        marginLeft: 12, 
    },

    rowTitle: {
        fontWeight: '600',
        color: COLORS.text || '#1a1a1a',
        fontSize: 14,
    },

    rowLabel: {
        color: '#666666',
        fontSize: 13,
        marginTop: 2,
    },

    infoContainer: {
        width: '100%',
        alignItems: 'flex-start', 
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: COLORS.text || '#1a1a1a',
    },
    
    innerModal: {
        borderRadius: 16,
        padding: 20,
    },

    titleIpt: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text || '#1a1a1a',
        marginBottom: 16,
        textAlign: 'center',
    },

    ipt: {
        backgroundColor: COLORS.background || '#f5f5f5',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: COLORS.text || '#1a1a1a',
        marginBottom: 20,
        minHeight: 50, 
        maxHeight: 150, 
    },

    iptFocused: {
        borderColor: COLORS.primary || '#007AFF',
        backgroundColor: '#FFFFFF',
    },

    modalBtn: {
        backgroundColor: COLORS.accent || COLORS.primary || '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: COLORS.accent || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    modalBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },

    btnPressed: {
        opacity: 0.90,
        transform: [{ scale: 0.99 }],
    }
});

export default ProfileData;