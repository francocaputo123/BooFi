import { Text, View,  TextInput ,StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

//constantes
import { COLORS, FONTSIZE, SPACING } from '@/constants/theme';

//data
import authData from "@/data/authData.json"

//components
import Card from "@/components/Card"

//types
import { registerForm ,viewStatus} from '@/types/auth.types';

//schema
import { loginSchema,registerSchema } from '@/schema/auth.schema';

const Auth = () => {

  const [form, setForm] = useState<registerForm>({
    username : "",
    email : "",
    password : "",
    confirmPassword : ""
  })

  const [formView, setFormView] = useState<viewStatus>("login")

  const [error, setError] = useState<string[]>([])

  const handleChange = (name : string, value : string) => {
    setError([])
    
    setForm({
      ...form,
      [name] : value
    })

  }

  const actions = {

    handleLogin : () => {
      const { email, password } = form

      const notAllowed = [null,"",undefined]

      const missing = [email, password].some(value => notAllowed.includes(value))

      if(missing){
        return setError(["Todos los campos son obligatorios"])
      }

      const result = loginSchema.safeParse({ email, password })

      if(!result.success) {
        const errors = result.error.issues.map(error => error.message)

        return setError(errors)
      }


    },
    handleRegister : () => {

      const notAllowed = [null,"",undefined]

      const missing = Object.values(form).some(value => notAllowed.includes(value))

      if(missing){
        return setError(["Todos los campos son obligatorios"])
      }

      const result = registerSchema.safeParse(form)

      if(!result.success) {
        const errors = result.error.issues.map(error => error.message)

        return setError(errors)
      }

    }
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
                    /**
                    NOTE: accedo a styles por su posicion porque es reactivo dependiendo del valor
                    que proviene de authData, en este caso 2: title y subtitle. 
                    Para que ts tome como valido el tipo de dato, se extrae la clave de la hoja de estilos
                    y se le pregunta si es de ese tipo.
                    **/
                    authData[formView].map((value) => (
                      <Text key={value.label} style={styles[value.style as keyof typeof styles]} > {value.label} </Text>
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
                        onPress={() => {
                          setFormView(value.type as viewStatus)
                          setError([])
                        }}
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
                          onChangeText={(text) => handleChange(key, text)}
                          secureTextEntry={value.type == "password" ? true : false}
                          style={styles.input}
                          />
                        </View>
                      ))
                    )
                  }
                  {
                    formView === "login" && (
                      Object.entries(loginFields).map(([key, value], i) => {
                        if(value.type === "link") {
                          return(
                            <Link
                            key={value.label}
                            style={styles.link}
                            href={"/PasswordRecovery"}
                            >
                              {value.label}
                            </Link>
                          )
                        }
                        return(
                          <View 
                          key={i}
                          style={styles.form}
                          >
                            <Text> {value.label} </Text>
                            <TextInput
                            onChangeText={(text) => handleChange(key, text)}
                            placeholder={value.placeholder}
                            style={styles.input}
                            />
                          </View>
                        )
                      })
                    )
                  }
                {
                  error.length > 0 && (
                    <View style={styles.errorContainer}>
                      {
                        error.map((error, i) => {
                          return(
                            <Text style={styles.errorText} key={i}>
                              - {error}
                            </Text>
                          )
                        })
                      }
                    </View>
                  )
                }
                </Card.Body>
                <Card.Footer>
                  {
                    authData.buttons.map((value) => {
                      if(value.type === formView){
                        return(
                          <Pressable
                          onPress={actions[value.action as keyof typeof actions]}
                          key={value.label}
                          style={styles.confirmButton}
                          >
                            <Text style={styles.confirmText}> {value.label} </Text>
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

    forgotPassword : {
        label : "¿Olvidaste tu contraseña?",
        placeholder : "",
        type : "link"
    }
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
    marginLeft : SPACING.m,
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
    marginBottom : SPACING.l
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

  title : {
    fontSize : FONTSIZE.xxl,
    paddingVertical : SPACING.s,
    fontWeight : 'bold'
  },

  subtitle : {
    fontSize : FONTSIZE.m,
    color : COLORS.textSecondary
  },

  link : {
    paddingHorizontal : SPACING.s,
    marginVertical : SPACING.s,
    alignSelf : 'flex-end',
    color : COLORS.primary,
    textShadowColor : COLORS.accent
  },

  confirmButton : {
    borderWidth : 1,
    alignItems : 'center',
    marginHorizontal: SPACING.s, 
    padding : SPACING.m,
    marginVertical: 12,
    borderRadius : 12,
    backgroundColor : COLORS.accent,
  },
  
  confirmText : {
    color : "#FFFFFF",
    fontWeight : 'bold'
  },

  errorContainer: {
    marginBottom: SPACING.s,
    paddingVertical: SPACING.s,
    marginHorizontal : SPACING.s,
    marginVertical : SPACING.s,
    backgroundColor: '#FFD2D2',
    borderRadius: 8,
  },

  errorText: {
    color: COLORS.danger,
    textAlign : 'center',
    fontSize: FONTSIZE.s,
  },

});

export default Auth