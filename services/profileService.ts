import { storage, auth, db } from "@/config/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as Crypto from 'expo-crypto'
import { setDoc, doc, serverTimestamp } from "firebase/firestore";


export const uploadImage = async (photo : Blob) => {

    if(!photo){
        return {
            status : "error",
            message : "Por favor, sube una imagen"
        }
    }

    const user = auth.currentUser

    if(user) {

        try {
            /** 
             Le damos un nombre unico a la imagen para despues guardarla en profiles.
             */

            const extension = photo?.type 
            const photoName = `${Crypto.randomUUID()}.${extension}`

            const storageRef = ref(storage, `avatar/${photoName}`)

            /** 
                Se sube como bytes al ser un tipo blob
            */
            
            const upload = await uploadBytes(storageRef, photo, {
                contentType : photo.type
            })

            const getUrl = await getDownloadURL(upload.ref)

            /** 
                Para guardar la imagen, primero obtenemos la referencia al usuario y posteriormente
                actualizar el perfil
            */
            const userRef = doc(db, 'profiles', user.uid)

            await setDoc(userRef, {
                photoUrl : getUrl,
                updatedAt : serverTimestamp()
            }, {merge : true})

            return getUrl
            
        } catch (error) {
            throw error
        }

    } 

    return 
}