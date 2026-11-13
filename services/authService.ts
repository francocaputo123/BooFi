import { writeBatch, getDoc, doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from "firebase/auth";
import { ref, deleteObject } from "firebase/storage";

//types
import { registerForm, loginForm} from "@/types/auth.types";

//utils
import { handleFirebaseError } from "@/utils/handleFirebaseError";

//conf
import { auth, db, storage } from "@/config/firebaseConfig";

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

/**
 * Elimina la cuenta y perfil del usuario autenticado sin eliminar sus libros publicados.
 */
export const deleteUserAccount = async () => {
    const user = auth.currentUser
    if (!user) {
        throw new Error("No hay un usuario autenticado")
    }

    const uid = user.uid

    // 1. Eliminar avatar de Firebase Storage si existe
    try {
        const profileRef = doc(db, 'profiles', uid)
        const profileSnap = await getDoc(profileRef)
        if (profileSnap.exists()) {
            const photoPath = profileSnap.data()?.photoPath
            if (photoPath) {
                try {
                    await deleteObject(ref(storage, photoPath))
                } catch (err) {
                    console.warn("[authService] No se pudo borrar el avatar del storage:", err)
                }
            }
            // 2. Eliminar documento en profiles/{uid}
            await deleteDoc(profileRef)
        }
    } catch (err) {
        console.warn("[authService] Error al eliminar perfil en Firestore:", err)
    }

    // 3. Eliminar documento en users/{uid}
    try {
        const userRef = doc(db, 'users', uid)
        await deleteDoc(userRef)
    } catch (err) {
        console.warn("[authService] Error al eliminar usuario en Firestore:", err)
    }

    // 4. Eliminar el usuario en Firebase Authentication (los libros publicados en 'books' NO se tocan)
    try {
        await deleteUser(user)
    } catch (error: any) {
        throw new Error(handleFirebaseError(error))
    }
}
