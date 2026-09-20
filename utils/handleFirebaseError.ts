export const handleFirebaseError = (error : any) => {
    switch(error?.code) {
        case 'auth/email-already-in-use' :
            return "El email ya se encuentra en uso"
        case 'auth/invalid-credential' :
            return "Credenciales incorrectas"
        defult :
            return "Error en la base de datos"
    }
}