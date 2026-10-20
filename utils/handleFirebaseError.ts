export const handleFirebaseError = (error : any) => {
    switch(error?.code) {
        case 'auth/email-already-in-use' :
            return "El email ya se encuentra en uso"
        case 'auth/invalid-credential' :
            return "Credenciales incorrectas"
        case 'storage/unauthorized' :
            return "No tenés permiso para subir archivos"
        case 'storage/quota-exceeded' :
            return "Se agotó el espacio de almacenamiento"
        case 'storage/retry-limit-exceeded' :
            return "Se cortó la conexión mientras se subía el libro. Probá de nuevo"
        case 'permission-denied' :
            return "No tenés permiso para guardar el libro"
        default :
            return "Error en la base de datos"
    }
}
