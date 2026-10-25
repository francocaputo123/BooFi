import {
  addDoc, collection, getDocs, getDoc, updateDoc, orderBy, query, serverTimestamp,
  doc, writeBatch, DocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/config/firebaseConfig"
import { handleFirebaseError } from "@/utils/handleFirebaseError"
import { Draft } from "@/types/draft.types"
import { chaptersRef } from "@/services/chapterService"

/** Referencia a la colección de historias de un usuario */
const draftsRef = (uid: string) => collection(db, "users", uid, "drafts")

/** Referencia a una historia puntual */
const draftRef = (uid: string, draftId: string) => doc(draftsRef(uid), draftId)

/**
 * Crea una historia vacía en la cuenta del usuario.
 * @param string uid : id del usuario logueado
 * @param string title : título inicial de la historia
 * @returns string : id de la historia creada
 */
export const createDraft = async (uid: string, title: string): Promise<string> => {
  try {
    const docRef = await addDoc(draftsRef(uid), {
      title,
      status: "in_progress",
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}

/**
 * Trae las historias del usuario, la más reciente primero.
 * @param string uid : id del usuario logueado
 * @returns Draft[] : lista de historias
 */
export const listDrafts = async (uid: string): Promise<Draft[]> => {
  try {
    const snapshot = await getDocs(query(draftsRef(uid), orderBy("updatedAt", "desc")))
    return snapshot.docs.map((draftDoc) => ({
      id: draftDoc.id,
      ...(draftDoc.data() as Omit<Draft, "id">),
    }))
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}

/**
 * Trae una historia por id.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @returns Draft : historia encontrada
 */
export const getDraft = async (uid: string, draftId: string): Promise<Draft> => {
  let snapshot: DocumentSnapshot
  try {
    snapshot = await getDoc(draftRef(uid, draftId))
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }

  // Fuera del try: dentro, handleFirebaseError taparía este mensaje con uno genérico
  if (!snapshot.exists()) {
    throw new Error("La historia no existe")
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<Draft, "id">) }
}

/**
 * Actualiza los datos de configuración de una historia.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @param object changes : campos a modificar (los que falten no se tocan)
 */
export const updateDraft = async (
  uid: string, draftId: string,
  changes: Partial<Pick<Draft, "title" | "status" | "tags" | "synopsis">>
) => {
  try {
    await updateDoc(draftRef(uid, draftId), {
      ...changes,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}

/**
 * Borra una historia con todos sus capítulos.
 * NOTE: Firestore no borra subcolecciones al borrar el documento padre, por eso se borran los capítulos a mano.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 */
export const deleteDraft = async (uid: string, draftId: string) => {
  try {
    const chaptersSnapshot = await getDocs(chaptersRef(uid, draftId))
    const batch = writeBatch(db)
    chaptersSnapshot.docs.forEach((chapterDoc) => batch.delete(chapterDoc.ref))
    batch.delete(draftRef(uid, draftId))
    await batch.commit()
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}