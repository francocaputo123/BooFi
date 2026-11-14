export type PurchaseStatus = "approved" | "pending" | "rejected";

export interface PurchaseRecord {
    bookId: string;
    title: string;
    price: number;
    currency: "ARS";
    status: PurchaseStatus;
    purchasedAt: string;
    paymentId?: string;
}

export interface CreatePurchaseParams {
    bookId: string;
    title: string;
    price: number;
    currency?: "ARS";
    paymentId?: string;
}

export interface BookAccessState {
    hasAccess: boolean;
    isCheckingAccess: boolean;
    isPaid: boolean;
    isPurchased: boolean;
    isAuthor: boolean;
    refreshAccess: () => Promise<void>;
}
