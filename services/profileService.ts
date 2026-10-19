import { storage, auth, db } from "@/config/firebaseConfig";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { setDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import * as Crypto from 'expo-crypto'


export const uploadImage = async (photo : Blob) => {

    const user = auth.currentUser

    if(user) {

        try {
            
            const userRef = doc(db, 'profiles', user.uid)

            const userSnap = await getDoc(userRef)

            if(userSnap.exists() && userSnap.data()?.photoPath) {
                
                /**
                 * Esta primer seccion sirve para eliminar la imagen previa (si existe)
                 * Utilizamos la ruta hacia la imagen guardada previamente en la db,
                 * la referenciamos en el storage y borramos la foto.
                 * 
                */
                const oldPhotoPath = userSnap.data().photoPath
                const oldStorageRef = ref(storage, oldPhotoPath)

                try {
                    await deleteObject(oldStorageRef)
                } catch (error) {
                    console.log("Error : " + error)
                }
            }

            /** 
             Le damos un nombre unico a la imagen para despues guardarla en profiles.
             Guardamos la referencia de la ruta hacia la imagen.
             */

            const extension = photo?.type 
            const photoName = `${Crypto.randomUUID()}.${extension}`
            const photoPath = `users/${user.uid}/avatar/${photoName}`

            const storageRef = ref(storage, photoPath)

            /** 
                Se sube como bytes al ser un tipo blob
            */
            
            const upload = await uploadBytes(storageRef, photo, {
                contentType : photo.type
            })

            const photoUrl = await getDownloadURL(upload.ref)

            /** 
                Usamos la referencia al usuario para guardar el perfil.
            */

            await setDoc(userRef, {
                photoUrl : photoUrl,
                photoPath :  photoPath,
                updatedAt : serverTimestamp()
            }, {merge : true})

            return photoUrl
            
        } catch (error) {
            throw error
        }
    } 
}

/* Coleccion de Firestore: profiles/{userId} */
export const PROFILES_COLLECTION = "profiles"

/**
 * Lee el username del perfil de un usuario.
 * Devuelve null si el perfil no existe, si no tiene username o si falla la lectura:
 * en cualquiera de esos casos el que llama decide como seguir.
 * @param userId : public_id del usuario (el mismo que usa authStore)
 * @returns string | null : username del perfil, o null
 */
export const fetchUsername = async (userId: string): Promise<string | null> => {
    try {
        const snapshot = await getDoc(doc(db, PROFILES_COLLECTION, userId))
        if (!snapshot.exists()) return null

        const data = snapshot.data()
        return typeof data.username === "string" && data.username.length > 0
            ? data.username
            : null
    } catch (error) {
        console.warn("[profileService] No se pudo leer el perfil:", error)
        return null
    }
}

export const updateUsername = async (userName : string) => {
    return 
}