import { collection, doc, getDoc, getDocs, setDoc, updateDoc, increment } from "firebase/firestore"
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
        const userPurchRef = purchaseRef(userId, params.bookId)

        // Verificamos si ya existe la compra aprobada para evitar procesarla múltiples veces
        const existingPurchSnap = await getDoc(userPurchRef)
        if (existingPurchSnap.exists()) {
            const existingData = existingPurchSnap.data() as Partial<PurchaseRecord>
            if (existingData.status === "approved" || !existingData.status) {
                return
            }
        }

        const record: PurchaseRecord = {
            bookId: params.bookId,
            title: params.title,
            price: params.price,
            currency: params.currency ?? "ARS",
            status: "approved",
            purchasedAt: now,
            paymentId: params.paymentId,
        }

        await setDoc(userPurchRef, record)

        // Registrar la venta para el autor del libro y actualizar estadísticas de forma idempotente
        try {
            const bookSnap = await getDoc(doc(db, "books", params.bookId))
            if (bookSnap.exists()) {
                const bookData = bookSnap.data()
                const authorId = bookData?.authorId
                if (authorId) {
                    // ID determinista para evitar duplicar registros ante múltiples invocaciones
                    const saleId = params.paymentId 
                        ? `${params.bookId}_${params.paymentId}` 
                        : `${params.bookId}_${userId}`
                    const authorSaleRef = doc(db, "users", authorId, "sales", saleId)

                    const existingSaleSnap = await getDoc(authorSaleRef)
                    if (!existingSaleSnap.exists()) {
                        await setDoc(authorSaleRef, {
                            bookId: params.bookId,
                            title: params.title,
                            price: params.price,
                            currency: params.currency ?? "ARS",
                            buyerId: userId,
                            purchasedAt: now,
                            paymentId: params.paymentId ?? null,
                        })

                        await updateDoc(doc(db, "books", params.bookId), {
                            salesCount: increment(1),
                        }).catch(() => {})
                    }
                }
            }
        } catch (err) {
            console.warn("[purchaseService] No se pudo registrar la venta en la subcolección del autor:", err)
        }
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
