import { useRouter } from "expo-router"
import authStore from "@/store/authStore"
import bookStore from "@/store/bookStore"
import { useAuthorName } from "@/hooks/useAuthorName"
import { getDraft } from "@/services/draftService"
import { listChapters } from "@/services/chapterService"
import { draftToBook, contentToBlocks } from "@/utils/draftToBook"
import { getMissingPublishFields } from "@/utils/getMissingPublishFields"

/**
 * Convierte una historia escrita en el editor en un libro del bookStore,
 * para leerla o publicarla con las mismas pantallas que usa un EPUB.
 * @param string draftId : id de la historia
 * @returns previewDraft y publishDraft : abren la ficha o la pantalla de publicar
 */
export const useDraftBook = (draftId: string) => {
  const router = useRouter()
  const uid = authStore((state) => state.public_id)
  const authorName = useAuthorName()
  const saveBook = bookStore((state) => state.saveBook)

  /**
   * Arma el libro desde Firestore y lo deja en el store.
   * NOTE: lanza un Error en vez de manejarlo acá; cada pantalla decide cómo mostrarlo.
   * @param boolean requireCompleteData : si es true, exige título, sinopsis y categoría (para publicar)
   */
  const prepareBook = async (requireCompleteData: boolean) => {
    // Las dos consultas son independientes, se piden a la vez
    const [draft, chapters] = await Promise.all([getDraft(uid, draftId), listChapters(uid, draftId)])
    
    if (requireCompleteData) {
      const missingFields = getMissingPublishFields(draft)
      if (missingFields.length > 0) {
        throw new Error(
          `Para publicar completá: ${missingFields.join(", ")}. Podés hacerlo en "Configuración de la historia".`
        )
      }
    }
    // Los capítulos sin texto no se incluyen: no hay nada que leer
    const writtenChapters = chapters.filter((chapter) => contentToBlocks(chapter.content).length > 0)
    if (writtenChapters.length === 0) {
      throw new Error("Escribí al menos un capítulo antes de continuar")
    }

    const book = draftToBook(draft, writtenChapters, authorName)
    saveBook(book)
    return book
  }

  /** Abre la ficha del libro para leer la historia como la vería un lector */
  const previewDraft = async () => {
    const book = await prepareBook(false)
    router.push({ pathname: "/books/Details", params: { id: book.id } })
  }

  /** Abre la pantalla de publicar con la historia ya cargada */
  const publishDraft = async () => {
    const book = await prepareBook(true)
    router.push({ pathname: "/books/Publish", params: { id: book.id } })
  }

  return { previewDraft, publishDraft }
}