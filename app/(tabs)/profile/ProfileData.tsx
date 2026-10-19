import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const ProfileData = () => {

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [change, setChange] = useState("")
    const [text, setText] = useState("")

    const userData = authStore(

        useShallow((state) => ({
            email : state.email,
            username : state.username,
            bio : state.bio
        }))
    )

    const actions = {
        
        updateUsername : () => {
            setIsModalOpen(true)
            setText("Actualizar nombre de usuario: ")
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
                                >
                                    <View style={styles.rowContainer}>
                                        <Ionicons name={field.icon as any} size={24} color={COLORS.secondary || "black"} />
                                        <View style={styles.textWrapper}>
                                            <Text style={styles.rowTitle}>{field.label}</Text>
                                            <Text style={styles.rowLabel}>
                                                {
                                                    field.type == "text" ? (
                                                        userData[field.text as keyof typeof userData]
                                                    ) : (
                                                        field.text
                                                    )
                                                }
                                            </Text>
                                        </View>
                                        <Ionicons name="arrow-forward" size={24} color={COLORS.primary || "black"} />
                                    </View>
                                </Pressable>
                            )
                        })
                    }

                    <Text style={styles.title}>Datos de cuenta</Text>
                    {
                        profile.bottom.map((field, i) => {
                            return(
                                <View key={field.text} style={styles.rowContainer}>
                                    <Ionicons name={field.icon as any} size={24} color={COLORS.secondary || "black"} />
                                    <View style={styles.textWrapper}>
                                        <Text style={styles.rowTitle}>{field.label}</Text>
                                        <Text style={styles.rowLabel}>{field.text}</Text>
                                    </View>
                                </View>
                            )
                        })
                    }
                </View>
            </ScrollView>
            <Modal
                outsideStyle={styles.outsideModal}
                innerStyle={styles.innerModal}
                isOpen={isModalOpen}
                setOpen={setIsModalOpen}
            >
                <Text style={styles.titleIpt}> {text} </Text>
                <TextInput
                onChangeText={setChange}
                style={styles.ipt}
                placeholder=''
                />
                <Pressable
                style={styles.modalBtn}
                >
                    <Text
                    style={styles.modalBtnText}
                    >
                        Actualizar
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
    
    innerModal : {
        borderRadius : 10
    },

    outsideModal : {
        borderWidth : 1,
        borderColor : 'black'
    },

    titleIpt : {
        fontWeight : 'bold'
    },

    ipt : {
        backgroundColor : COLORS.background,
        borderRadius : 10,
        borderWidth : 0.5,
        marginVertical : 10
    },

    modalBtn : {
        backgroundColor : COLORS.accent,
        padding : 8,
        borderRadius : 8,
        alignSelf : 'center'
    },

    modalBtnText : {
        color : COLORS.text,
        fontWeight : 'bold'
    }
});

export default ProfileData;