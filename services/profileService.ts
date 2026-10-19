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

export const updateUsername = async (userName : string) => {
    return 
}