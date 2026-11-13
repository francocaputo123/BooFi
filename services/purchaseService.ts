import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore"
import { db } from "@/config/firebaseConfig"
import { handleFirebaseError } from "@/utils/handleFirebaseError"
import { CreatePurchaseParams, PurchaseRecord } from "@/types/purchase.types"

export const PURCHASES_SUBCOLLECTION = "purchases"

/**
 * Referencia al documento de compra de un libro para un usuario puntual:
 * users/{userId}/purchases/{bookId}
 */
const purchaseRef = (userId: string, bookId: string) =>
    doc(db, "users", userId, PURCHASES_SUBCOLLECTION, bookId)

/**
 * Referencia a la subcolección de compras del usuario:
 * users/{userId}/purchases
 */
const purchasesRef = (userId: string) =>
    collection(db, "users", userId, PURCHASES_SUBCOLLECTION)

/**
 * Consulta si un usuario compró un libro específico en Firestore.
 * @param userId ID del usuario
 * @param bookId ID del libro
 * @returns boolean true si el usuario tiene el libro comprado y aprobado
 */
export const checkUserPurchasedBook = async (
    userId: string,
    bookId: string
): Promise<boolean> => {
    if (!userId || !bookId) return false

    try {
        const snapshot = await getDoc(purchaseRef(userId, bookId))
        if (!snapshot.exists()) return false

        const data = snapshot.data() as Partial<PurchaseRecord>
        return data.status === "approved" || !data.status
    } catch (error) {
        console.error("[purchaseService] Error al verificar compra:", error)
        return false
    }
}

/**
 * Registra la compra de un libro para un usuario en Firestore.
 * @param userId ID del usuario comprador
 * @param params Datos del libro comprado
 */
export const recordBookPurchase = async (
    userId: string,
    params: CreatePurchaseParams
): Promise<void> => {
    if (!userId) {
        throw new Error("Usuario no autenticado para registrar la compra")
    }

    try {
        const now = new Date().toISOString()
        const record: PurchaseRecord = {
            bookId: params.bookId,
            title: params.title,
            price: params.price,
            currency: params.currency ?? "ARS",
            status: "approved",
            purchasedAt: now,
            paymentId: params.paymentId,
        }

        await setDoc(purchaseRef(userId, params.bookId), record)
    } catch (error) {
        console.error("[purchaseService] Error al guardar compra:", error)
        throw new Error(handleFirebaseError(error))
    }
}

/**
 * Obtiene todas las compras realizadas por un usuario.
 * @param userId ID del usuario
 */
export const getUserPurchases = async (userId: string): Promise<PurchaseRecord[]> => {
    if (!userId) return []

    try {
        const snapshot = await getDocs(purchasesRef(userId))
        return snapshot.docs.map((docSnap) => docSnap.data() as PurchaseRecord)
    } catch (error) {
        console.error("[purchaseService] Error al obtener compras:", error)
        return []
    }
}
