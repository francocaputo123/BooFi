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
    },

    setChapterBlocks : (bookId, chapterIndex, blocks) => {
        set((state) => {
            const book = state.booksById[bookId]
            if (!book) return state

            const chapters = book.chapters.map((chapter, index) =>
                index === chapterIndex ? { ...chapter, blocks, isLoaded : true } : chapter
            )

            return {
                booksById : {
                    ...state.booksById,
                    [bookId] : { ...book, chapters }
                }
            }
        })
    }
}))

export default bookStore
