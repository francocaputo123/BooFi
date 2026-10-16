import { create } from "zustand";
import { BookState } from "@/types/book.types";

// NOTE: vive solo en memoria. Cuando el catalogo viva en Firestore se reemplaza por una consulta
const bookStore = create<BookState>()((set) => ({
    booksById : {},

    saveBook : (book) => {
        set((state) => ({
            booksById : {
                ...state.booksById,
                [book.id] : book
            }
        }))
    }
}))

export default bookStore
