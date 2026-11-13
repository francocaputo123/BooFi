import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { BOOKS_COLLECTION } from "@/data/publishData";

export interface SaleItem {
    id: string;
    bookId: string;
    title: string;
    price: number;
    purchasedAt: string;
    authorNet: number;
    appFee: number;
    paymentId?: string;
    buyerId?: string;
}

export interface BestSellerBook {
    bookId: string;
    title: string;
    coverUrl: string | null;
    price: number;
    salesCount: number;
    totalRevenue: number;
}

export interface AuthorEarningsData {
    totalGross: number;         // 100% de lo recaudado por ventas brutas
    appFee: number;             // 30% retenido por la aplicación BooFi
    authorNet: number;          // 70% ganancias netas del autor
    totalSalesCount: number;    // Cantidad total de ejemplares vendidos
    paidBooksCount: number;     // Cantidad de libros pagos que ha publicado el autor
    bestSeller: BestSellerBook | null;
    recentSales: SaleItem[];
    hasPaidBooks: boolean;
}

/**
 * Obtiene las ganancias y estadísticas de ventas de un autor en BooFi.
 * Desglosa el 30% para la plataforma y el 70% para el autor.
 * @param authorId : public_id del autor
 */
export const fetchAuthorEarnings = async (authorId: string): Promise<AuthorEarningsData> => {
    if (!authorId) {
        return {
            totalGross: 0,
            appFee: 0,
            authorNet: 0,
            totalSalesCount: 0,
            paidBooksCount: 0,
            bestSeller: null,
            recentSales: [],
            hasPaidBooks: false,
        };
    }

    try {
        // 1. Obtener todos los libros publicados por este autor
        const booksQuery = query(
            collection(db, BOOKS_COLLECTION),
            where("authorId", "==", authorId)
        );
        const booksSnap = await getDocs(booksQuery);

        const booksById = new Map<string, {
            id: string;
            title: string;
            coverUrl: string | null;
            price: number;
            visibility: string;
            salesCountDoc: number;
        }>();

        let paidBooksCount = 0;

        booksSnap.forEach((docSnap) => {
            const data = docSnap.data();
            const isPaid = data.visibility === "paid";
            const price = typeof data.price === "number" ? data.price : 0;
            const salesCountDoc = typeof data.salesCount === "number" ? data.salesCount : 0;

            if (isPaid) {
                paidBooksCount++;
            }

            booksById.set(docSnap.id, {
                id: docSnap.id,
                title: typeof data.title === "string" ? data.title : "Sin título",
                coverUrl: typeof data.coverUrl === "string" ? data.coverUrl : null,
                price,
                visibility: data.visibility || "public",
                salesCountDoc,
            });
        });

        // 2. Obtener las ventas registradas del autor en users/{authorId}/sales
        let salesList: SaleItem[] = [];
        try {
            const salesRef = collection(db, "users", authorId, "sales");
            const salesSnap = await getDocs(salesRef);

            salesSnap.forEach((docSnap) => {
                const s = docSnap.data();
                const price = typeof s.price === "number" ? s.price : 0;
                const appFee = Math.round(price * 0.30);
                const authorNet = price - appFee;

                salesList.push({
                    id: docSnap.id,
                    bookId: s.bookId || "",
                    title: s.title || (booksById.get(s.bookId)?.title ?? "Libro vendido"),
                    price,
                    purchasedAt: s.purchasedAt || new Date().toISOString(),
                    appFee,
                    authorNet,
                    paymentId: s.paymentId || undefined,
                    buyerId: s.buyerId || undefined,
                });
            });

            // Deduplicar ventas duplicadas por reintentos o callbacks simultáneos
            const seenKeys = new Set<string>();
            const uniqueSales: SaleItem[] = [];

            salesList.forEach((sale) => {
                const key = sale.paymentId
                    ? `pay_${sale.bookId}_${sale.paymentId}`
                    : `buy_${sale.bookId}_${sale.buyerId || 'anon'}_${Math.floor(Date.parse(sale.purchasedAt) / (60 * 1000))}`;

                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueSales.push(sale);
                }
            });

            salesList = uniqueSales;
        } catch (err) {
            console.warn("[earningsService] No se pudo leer la subcolección de ventas:", err);
        }

        // 3. Contabilizar ventas por libro
        const statsByBook = new Map<string, { salesCount: number; totalRevenue: number }>();

        // Si tenemos registros en la subcolección de ventas
        if (salesList.length > 0) {
            salesList.forEach((sale) => {
                const existing = statsByBook.get(sale.bookId) || { salesCount: 0, totalRevenue: 0 };
                statsByBook.set(sale.bookId, {
                    salesCount: existing.salesCount + 1,
                    totalRevenue: existing.totalRevenue + sale.price,
                });
            });
        } else {
            // Si no hay subcolección pero los libros tienen salesCountDoc
            booksById.forEach((b, bId) => {
                if (b.salesCountDoc > 0) {
                    statsByBook.set(bId, {
                        salesCount: b.salesCountDoc,
                        totalRevenue: b.salesCountDoc * b.price,
                    });
                }
            });
        }

        // 4. Calcular totales
        let totalGross = 0;
        let totalSalesCount = 0;

        if (salesList.length > 0) {
            totalGross = salesList.reduce((acc, curr) => acc + curr.price, 0);
            totalSalesCount = salesList.length;
        } else {
            statsByBook.forEach((stat) => {
                totalGross += stat.totalRevenue;
                totalSalesCount += stat.salesCount;
            });
        }

        const appFee = Math.round(totalGross * 0.30);
        const authorNet = totalGross - appFee;

        // 5. Determinar el libro más vendido
        let bestSeller: BestSellerBook | null = null;
        let maxSales = -1;

        booksById.forEach((book, bId) => {
            if (book.visibility === "paid") {
                const stat = statsByBook.get(bId) || { salesCount: 0, totalRevenue: 0 };
                if (stat.salesCount > maxSales) {
                    maxSales = stat.salesCount;
                    bestSeller = {
                        bookId: bId,
                        title: book.title,
                        coverUrl: book.coverUrl,
                        price: book.price,
                        salesCount: stat.salesCount,
                        totalRevenue: stat.totalRevenue,
                    };
                }
            }
        });

        // Ordenar ventas recientes (las más nuevas primero)
        salesList.sort((a, b) => Date.parse(b.purchasedAt) - Date.parse(a.purchasedAt));

        return {
            totalGross,
            appFee,
            authorNet,
            totalSalesCount,
            paidBooksCount,
            bestSeller,
            recentSales: salesList.slice(0, 10),
            hasPaidBooks: paidBooksCount > 0,
        };
    } catch (error) {
        console.error("[earningsService] Error al calcular ganancias del autor:", error);
        return {
            totalGross: 0,
            appFee: 0,
            authorNet: 0,
            totalSalesCount: 0,
            paidBooksCount: 0,
            bestSeller: null,
            recentSales: [],
            hasPaidBooks: false,
        };
    }
};
