import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

//schema
import { validatePassword } from '@/schema/auth.schema'

// Constants
import { SPACING, COLORS } from '@/constants/theme'

//data
import profilePassword from '@/data/profilePassword.json'

//types
import { passwordFields } from '@/types/password.types';

const ProfilePassword = () => {

    const [error, setError] = useState<string[]>([])

    const [password, setPassword] = useState<passwordFields>({
        currentPassword : "",
        newPassword : "",
        repeatPassword : ""
    })

    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({
        currentPassword: false,
        newPassword: false,
        repeatPassword: false,
    })

    const handleChange = (name : string, value : string) => {
        setError([])
        
        setPassword({
        ...password,
        [name] : value
        })
    }

    const handleChangeVisibility = (key : string) => {
        setShowPassword((prev) => ({
            ...prev,
            [key] : !prev[key]
        }))
    }

    const handleUpdatePassword = () => {

        const notAllowed = [null, "", undefined]

        const isInvalid = Object.values(password).some((field) => notAllowed.includes(field))

        if(isInvalid) {
            return({
                status : "Error",
                message : "No puede haber campos vacios."
            })
        }
        
        
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>Cambiar contraseña</Text>
                    <Text style={styles.subtitle}>
                        Asegúrate de usar una contraseña segura que no utilices en otros sitios.
                    </Text>

                    {
                        profilePassword.fields.map((ipt, i) =>{
                            return(
                               <View
                               key={ipt.key} 
                               style={styles.inputGroup}
                               >
                                <Text style={styles.label}> {ipt.label} </Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name={ipt.icon as any} size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                    onChangeText={(text) => handleChange(ipt.key, text)}
                                        style={styles.input}
                                        secureTextEntry={!showPassword[ipt.key as keyof typeof showPassword]}
                                        placeholder={ipt.placeholder}
                                        placeholderTextColor="#999"
                                    />
                                    <Pressable
                                    onPress={() => handleChangeVisibility(ipt.key)}
                                    >
                                        <Ionicons 
                                        name={showPassword[ipt.key as keyof typeof showPassword] ? "eye-off-outline" : "eye-outline"} 
                                        size={20} 
                                        color="#666" />
                                    </Pressable>
                                </View>
                            </View> 
                            )
                        })
                    }

                    <Pressable
                        onPress={() => handleUpdatePassword()}
                        style={({ pressed }) => [
                            styles.saveBtn,
                            pressed && styles.btnPressed
                        ]}
                    >
                        <Text style={styles.saveBtnText}>Actualizar contraseña</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background || '#f8f9fa',
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING?.l || 16,
        paddingVertical: SPACING?.m || 12,
    },

    container: {
        width: '100%',
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text || '#1a1a1a',
        marginBottom: 6,
    },

    subtitle: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 24,
        lineHeight: 20,
    },

    inputGroup: {
        marginBottom: 18,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text || '#1a1a1a',
        marginBottom: 8,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface || '#ffffff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        paddingHorizontal: 14,
        height: 50,
    },

    inputIcon: {
        marginRight: 10,
    },

    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text || '#1a1a1a',
    },

    saveBtn: {
        backgroundColor: COLORS.primary || '#007AFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: COLORS.primary || '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    btnPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
});

export default ProfilePassword;