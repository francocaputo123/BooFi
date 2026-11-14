import { useCallback, useState } from "react"
import { useFocusEffect } from "expo-router"
import authStore from "@/store/authStore"
import { checkUserPurchasedBook } from "@/services/purchaseService"
import { EpubParsedBook } from "@/types/epub.types"
import { BookAccessState } from "@/types/purchase.types"

/**
 * Hook para determinar si el usuario actual tiene acceso de lectura a un libro.
 * Se considera con acceso si:
 * 1. El libro no está publicado (es borrador / local).
 * 2. El libro es público (visibility !== "paid").
 * 3. El usuario actual es el autor que lo publicó.
 * 4. El usuario actual compró el libro en Firestore.
 */
export const useBookAccess = (
    bookId: string,
    book: EpubParsedBook | null | undefined
): BookAccessState => {
    const currentUserId = authStore((state) => state.public_id)
    const [isCheckingAccess, setIsCheckingAccess] = useState(true)
    const [isPurchased, setIsPurchased] = useState(false)

    const isPublished = book?.isPublished === true
    const isPaid = isPublished && book?.visibility === "paid"
    const isAuthor = Boolean(currentUserId && book?.authorId && book.authorId === currentUserId)

    const checkAccess = useCallback(async () => {
        if (!bookId || !isPaid) {
            setIsCheckingAccess(false)
            return
        }

        if (isAuthor) {
            setIsCheckingAccess(false)
            return
        }

        if (!currentUserId) {
            setIsPurchased(false)
            setIsCheckingAccess(false)
            return
        }

        setIsCheckingAccess(true)
        try {
            const purchased = await checkUserPurchasedBook(currentUserId, bookId)
            setIsPurchased(purchased)
        } catch {
            setIsPurchased(false)
        } finally {
            setIsCheckingAccess(false)
        }
    }, [bookId, isPaid, isAuthor, currentUserId])

    useFocusEffect(
        useCallback(() => {
            checkAccess()
        }, [checkAccess])
    )

    const hasAccess = !isPaid || isAuthor || isPurchased

    return {
        hasAccess,
        isCheckingAccess,
        isPaid,
        isPurchased,
        isAuthor,
        refreshAccess: checkAccess,
    }
}
