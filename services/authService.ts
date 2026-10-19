import { writeBatch, getDoc, doc, setDoc, serverTimestamp} from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "firebase/auth";

//types
import { registerForm, loginForm} from "@/types/auth.types";

//utils
import { handleFirebaseError } from "@/utils/handleFirebaseError";

//conf
import { auth, db } from "@/config/firebaseConfig";

export const registerUser = async (formData : registerForm) => {
    try {
        const {username, email, password} = formData

        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        const user = userCredential.user

        /**
            Se inicia una transaccion con batch.
            Si por algun motivo no se crea el usuario, el perfil tampoco.
            Separamos perfil de usuario para mantener los datos de la cuenta por separado.  
        */
        const batch = writeBatch(db);

        const userRef = doc(db, 'users', user.uid)
        const profileRef = doc(db, 'profiles', user.uid)

        const userData = {
            email : email,
            role : "user",
            createdAt : serverTimestamp()
        }

        const profileData = {
            username : username,
            photoUrl : "",
            photoPath : "",
            bio : "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }

        batch.set(userRef, userData);
        batch.set(profileRef, profileData);

        await batch.commit();

        return true
    } catch (error) {
        throw new Error(handleFirebaseError(error))
    }
}

export const loginUser = async (formData: loginForm) => {
    try {
        const {email, password} = formData

        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        const user = userCredential.user

        const profileRef = doc(db, 'profiles', user.uid)
        const profile = await getDoc(profileRef)

        if(!profile.exists()) {
            throw new Error("No se encontraron datos con ese perfil")
        }

        const userData = {
            public_id : user.uid,
            email : user.email,
            username : profile.data().username,
            bio : profile.data().bio || "",
            photoUrl : profile.data().photoUrl || "",
            photoPath : profile.data().photoPath || ""
        }

        return userData

    } catch (error) {
        throw new Error(handleFirebaseError(error))
    }
}

export const destroyAuth = async () => {
    try {
        await signOut(auth)
    } catch (error : any) {
        throw new Error(error.message)
    }
}
