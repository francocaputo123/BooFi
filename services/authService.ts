import { collection, addDoc, getDoc, doc, setDoc} from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import { auth, db } from "@/config/firebaseConfig";
import { registerForm, loginForm} from "@/types/auth.types";
import { handleFirebaseError } from "@/utils/handleFirebaseError";

export const registerUser = async (formData : registerForm) => {
    try {
        const {username, email, password} = formData

        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        const user = userCredential.user

        const docRef = doc(db, 'users', user.uid)

        const userData = {
            username : username,
            email : email,
            createdAt : new Date().toISOString()
        }

        await setDoc(docRef, userData)

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

        const docRef = doc(db, 'users', user.uid)
        const userRef = await getDoc(docRef)

        if(!userRef.exists()) {
            throw new Error("No se encontraron datos con ese perfil")
        }

        const userData = {
            public_id : user.uid,
            email : userRef.data().email,
            username : userRef.data().username
        }

        return userData

    } catch (error) {
        throw new Error(handleFirebaseError(error))
    }
}
