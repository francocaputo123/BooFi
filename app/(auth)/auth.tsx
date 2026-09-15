import { Text, View,  TextInput ,StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

//constantes
import { COLORS, FONTSIZE, SPACING } from '@/constants/theme';

//data
import authData from "@/data/authData.json"

//components
import Card from "@/components/Card"

//types
import { registerForm, viewStatus} from '@/types/auth.types';

const Auth = () => {

  const [form, setForm] = useState<registerForm>({
    username : "",
    email : "",
    password : "",
    confirmPassword : ""
  })

  const [formView, setFormView] = useState<viewStatus>("signup")

  const actions = {
    handleChange : () => {

    },
    handleLogin : null,
    handleRegister : null
  }

  return (
    <View style={styles.screenBackground}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        >
          <Text style={styles.text}>BooFi</Text>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
              <Card style={styles.card}>
                <Card.Header
                style={styles.header}
                >
                  {
                    authData[formView].map((value) => (
                      <Text key={value.label}> {value.label} </Text>
                    ))
                  }
                </Card.Header>

                <Card.Body
                >
                  <View
                  style={styles.buttonContainer}
                  >
                    {
                      authData.buttons.map((value) => (
                        <Pressable
                        key={value.label}
                        onPress={() => setFormView(value.type as viewStatus)}
                        style={[styles.button, value.type === formView && styles.buttonActive]}
                        >
                          <Text style={value.type === formView && styles.textActive}> {value.label} </Text>
                        </Pressable>
                      ))
                    }
                  </View>
                  {
                    formView === "signup" && (
                      Object.entries(registerFields).map(([key, value], i) => (
                        <View 
                        key={i}
                        style={styles.form}
                        >
                          <Text> {value.label} </Text>
                          <TextInput
                          placeholder={value.placeholder}
                          secureTextEntry={value.type == "password" ? true : false}
                          style={styles.input}
                          />
                        </View>
                      ))
                    )
                  }
                  {
                    formView === "login" && (
                      Object.entries(loginFields).map(([key, value], i) => (
                        <View 
                        key={i}
                        style={styles.form}
                        >
                          <Text> {value.label} </Text>
                          <TextInput
                          placeholder={value.placeholder}
                          style={styles.input}
                          />
                        </View>
                      ))
                    )
                  }
                </Card.Body>
                <Card.Footer
                style={styles.footer}
                >
                  {
                    authData.buttons.map((value) => {
                      if(value.type === formView){
                        return(
                          <Pressable>
                            <Text> {value.label} </Text>
                          </Pressable>
                        )
                      }
                    })
                  }
                </Card.Footer>
              </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const registerFields = {
    username : {
        label : "Nombre de usuario",
        placeholder : "@nombre_usuario",
        type : "text"
    },

    email : {
        label : "Email",
        placeholder : "hola@gmail.com",
        type : "email"
    },

    password : {
        label : "Contraseña",
        placeholder : "Ingrese una contraseña",
        type : "password"
    },

    confirmPassword : {
        label : "Repita su contraseña",
        placeholder : "",
        type : "password"
    }
}

const loginFields = {
  email : {
        label : "Email",
        placeholder : "Ingrese su email",
        type : "email"
    },

    password : {
        label : "Contraseña",
        placeholder : "Ingrese su contraseña",
        type : "password"
    },
}

const styles = StyleSheet.create({
  
  screenBackground: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContainer : {
    flexGrow : 1,
    justifyContent : 'center'
  },
  
  container: {
    flex : 1,
    padding : SPACING.xl
  },

  cardContainer : {
    marginTop : SPACING.s,
    flex : 1,
    justifyContent : 'center'
  },

  text: {
    color: COLORS.text,
    fontSize : FONTSIZE.xl,
    fontWeight : 'bold'
  },

  card : {
    padding : SPACING.s
  },

  form : {
    paddingHorizontal: SPACING.s, 
    paddingVertical: 5,
  },

  input : {
    marginTop : 5,
    borderWidth: 1,
    padding: 15,
    borderRadius : 10,
  },

  header : {
    padding : SPACING.s,
  },

  buttonContainer : {
    flexDirection : 'row',
    marginHorizontal: SPACING.s, 
    marginVertical: 12,
    borderWidth : 1,
    borderRadius : 10,
    overflow : "hidden",
    padding : 4
  },

  button : {
    flex : 1,
    alignItems: 'center', 
    justifyContent: 'center',
  },

  buttonActive : {
    padding : 15,
    paddingVertical: 12,
    backgroundColor : COLORS.primary,
    borderRadius : 5
  },
  
  textActive : {
    color : "#FFFFFF",
    fontWeight : 'bold'
  },

  footer : {
    borderWidth : 1,
    alignItems : 'center',
    marginHorizontal: SPACING.s, 
    padding : SPACING.m,
    marginVertical: 12,
    borderRadius : 12,
    backgroundColor : COLORS.secondary
  }
});

export default Auth