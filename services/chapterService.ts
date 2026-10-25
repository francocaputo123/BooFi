import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc, orderBy, query,
  serverTimestamp, writeBatch, DocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/config/firebaseConfig"
import { handleFirebaseError } from "@/utils/handleFirebaseError"
import { Chapter } from "@/types/chapter.types"
import { DEFAULT_CHAPTER_ACCESS } from "@/constants/chapterAccess"

/** Referencia a la subcolección de capítulos de una historia */
export const chaptersRef = (uid: string, draftId: string) =>
  collection(db, "users", uid, "drafts", draftId, "chapters")

/** Referencia a un capítulo puntual */
const chapterRef = (uid: string, draftId: string, chapterId: string) =>
  doc(chaptersRef(uid, draftId), chapterId)

/**
 * Crea un capítulo vacío al final de la historia.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @param string title : título inicial del capítulo
 * @param number order : posición del capítulo dentro de la historia
 * @returns string : id del capítulo creado
 */
export const createChapter = async (
  uid: string, draftId: string, title: string, order: number
): Promise<string> => {
  try {
    const docRef = await addDoc(chaptersRef(uid, draftId), {
      title,
      order,
      content: "",
      access: DEFAULT_CHAPTER_ACCESS,
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}

/**
 * Trae los capítulos de una historia ordenados por posición.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @returns Chapter[] : capítulos de la historia
 */
export const listChapters = async (uid: string, draftId: string): Promise<Chapter[]> => {
  try {
    const snapshot = await getDocs(query(chaptersRef(uid, draftId), orderBy("order", "asc")))
    return snapshot.docs.map((chapterDoc) => ({
      id: chapterDoc.id,
      ...(chapterDoc.data() as Omit<Chapter, "id">),
    }))
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}

/**
 * Trae un capítulo por id.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @param string chapterId : id del capítulo
 * @returns Chapter : capítulo encontrado
 */
export const getChapter = async (
  uid: string, draftId: string, chapterId: string
): Promise<Chapter> => {
  let snapshot: DocumentSnapshot
  try {
    snapshot = await getDoc(chapterRef(uid, draftId, chapterId))
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }

  // Fuera del try: dentro, handleFirebaseError taparía este mensaje con uno genérico
  if (!snapshot.exists()) {
    throw new Error("El capítulo no existe")
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<Chapter, "id">) }
}

/**
 * Guarda el título y el contenido de un capítulo.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @param string chapterId : id del capítulo
 * @param object changes : nuevo título y contenido
 */
export const updateChapter = async (
  uid: string, draftId: string, chapterId: string,
  changes: Pick<Chapter, "title" | "content">
) => {
  try {
    await updateDoc(chapterRef(uid, draftId, chapterId), {
      title: changes.title,
      content: changes.content,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}

/**
 * Borra un capítulo.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @param string chapterId : id del capítulo
 */
export const deleteChapter = async (uid: string, draftId: string, chapterId: string) => {
  try {
    await deleteDoc(chapterRef(uid, draftId, chapterId))
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}

/**
 * Intercambia el orden de dos capítulos en una sola operación.
 * NOTE: se usa batch para que no quede a medias si falla la red.
 * @param string uid : id del usuario logueado
 * @param string draftId : id de la historia
 * @param Chapter first : primer capítulo
 * @param Chapter second : capítulo con el que se intercambia
 */
export const swapChapterOrder = async (
  uid: string, draftId: string, first: Chapter, second: Chapter
) => {
  try {
    const batch = writeBatch(db)
    batch.update(chapterRef(uid, draftId, first.id), { order: second.order })
    batch.update(chapterRef(uid, draftId, second.id), { order: first.order })
    await batch.commit()
  } catch (error) {
    throw new Error(handleFirebaseError(error))
  }
}