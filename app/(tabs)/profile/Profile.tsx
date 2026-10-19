import { SafeAreaView } from "react-native-safe-area-context"
import { View, StyleSheet, Text, Image, Pressable } from "react-native"
import { useRouter } from "expo-router"

//constants
import { COLORS, SPACING } from "@/constants/theme"

//data
import profileData from "@/data/profileData.json"

//icons
import { Ionicons } from "@expo/vector-icons"

//store
import authStore from "@/store/authStore"

//firebase
import { destroyAuth } from '@/services/authService'

const Profile = () => {

    const router = useRouter()

    const loggout = authStore((state) => state.loggout)
    const profilePhoto = authStore((state) => state.photoUrl)

    const actions = {
        loggout : () => {
            loggout()
            destroyAuth()
            router.replace('/(auth)/Auth')
        },

        handleMyData : () => {
            router.push('/profile/ProfileData')
        },

        handleMyBooks : () => {
            router.push('/profile/ProfileBooks')
        }
    }

    return(
        <View style={styles.screenBackground}>
            <SafeAreaView style={styles.container}>
                <Pressable
                    onPress={() => router.push("/profile/ProfileCamera")}
                >
                    <Image 
                    style={styles.profileImage}
                    alt="Foto de perfil"
                    source={profilePhoto ?  { uri : profilePhoto } : require('@/assets/images/default_profile.png')}
                    />
                </Pressable>
                <View
                style={styles.buttonContainer}
                >
                    {
                        profileData.buttons.map(btn => {
                            if(btn.type === "button") {
                                return(
                                    <Pressable
                                        key={btn.label}
                                        onPress={actions[btn.action as keyof typeof actions]}
                                        style={styles.btn}
                                    >
                                        <Text
                                        style={styles.btnText}
                                        >
                                            {btn.label}
                                        </Text>
                                    </Pressable>
                                )
                            }
                            return(
                                <Pressable
                                    key={btn.label}
                                    style={styles.link}
                                    onPress={actions[btn.action as keyof typeof actions]}
                                >
                                    <Ionicons 
                                            name="log-out-outline" 
                                            size={20} 
                                            color={"red"} 
                                            style={styles.loggoutIcon}
                                    />
                                    <Text
                                    style={styles.textLink}
                                    >
                                        {btn.label}
                                    </Text>
                                </Pressable>
                            ) 
                        })
                    }
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    screenBackground: {
        flex: 1,
        backgroundColor: COLORS.background,
      },
    
      container : {
        alignItems : "center",
        padding : SPACING.s
      },

      profileImage : {
        width: 150,
        height: 150,
        borderRadius: 75, 
        borderWidth: 2,
        borderColor: COLORS.primary,
        resizeMode: 'cover', 
    },

      buttonContainer : {
        width : '80%',
        alignContent : "flex-start",
        marginTop : SPACING.m
      },

      btn : {
        borderColor : 'black',
        borderWidth : 1,
        padding : SPACING.m,
        borderRadius : 20,
        marginVertical : SPACING.xs,
        backgroundColor : COLORS.primary
      },

      btnText : {
        color : 'white',
        fontWeight : 'bold'
      },

      link : {
        flexDirection : "row",
        padding : SPACING.m,
        alignSelf : "center",
      },

      textLink : {
        fontWeight : "bold",
        fontSize : 16
      },

      loggoutIcon : {
        marginRight : SPACING.s
      } 
})


export default Profile