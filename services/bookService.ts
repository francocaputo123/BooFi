import { doc, getDoc, setDoc } from "firebase/firestore"
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/config/firebaseConfig"
import {
    PublishBookParams,
    PublishBookResult,
    PublishedBookData,
    PublishedChapter,
} from "@/types/book.types"
import { EpubBlock, EpubChapter } from "@/types/epub.types"
import {
    BOOKS_COLLECTION,
    CHAPTER_CONTENT_TYPE,
    CHAPTER_IMAGE_ATTEMPTS,
    JPEG_CONTENT_TYPE,
    MAX_CHAPTER_IMAGE_BYTES,
    UPLOAD_BATCH_SIZE,
} from "@/data/publishData"
import { buildPublishedBookId } from "@/utils/buildBookId"
import { normalizeTitle } from "@/utils/normalizeTitle"
import { buildChapterImagePath, buildChapterPath, buildCoverPath } from "@/utils/storagePaths"
import { handleFirebaseError } from "@/utils/handleFirebaseError"
import { prepareImageForUpload } from "@/utils/prepareImage"

/* Sube un capitulo como archivo JSON (sin espacios de mas, para que pese lo menos posible) */
const uploadChapter = async (bookId: string, chapter: PublishedChapter) => {
    const chapterRef = ref(storage, buildChapterPath(bookId, chapter.index))
    await uploadString(chapterRef, JSON.stringify(chapter), "raw", {
        contentType: CHAPTER_CONTENT_TYPE,
    })
}

/*
 * Prepara y sube una imagen de capitulo: la achica a JPEG, la sube a Storage y devuelve su URL.
 * La ruta se anota en uploadedPaths ANTES de subir, asi si falla a mitad de camino tambien se limpia.
 * Devuelve null si la imagen no se pudo preparar: en ese caso el bloque se descarta.
 */
const uploadChapterImage = async (
    bookId: string,
    chapterIndex: number,
    imageIndex: number,
    imageUri: string,
    uploadedPaths: string[]
): Promise<string | null> => {
    const base64 = await prepareImageForUpload(
        imageUri,
        CHAPTER_IMAGE_ATTEMPTS,
        MAX_CHAPTER_IMAGE_BYTES
    )
    if (!base64) return null

    const imagePath = buildChapterImagePath(bookId, chapterIndex, imageIndex)
    uploadedPaths.push(imagePath)
    const imageRef = ref(storage, imagePath)
    await uploadString(imageRef, base64, "base64", {
        contentType: JPEG_CONTENT_TYPE,
    })
    return await getDownloadURL(imageRef)
}

/*
 * Recorre los bloques de un capitulo y sube cada imagen a Storage.
 * Devuelve los bloques con "imageUrl" apuntando a Storage y sin "imageUri" (que era local).
 * Los bloques de imagen que fallan al prepararse o subirse se descartan.
 */
const uploadChapterImages = async (
    bookId: string,
    chapterIndex: number,
    blocks: EpubBlock[],
    uploadedPaths: string[]
): Promise<EpubBlock[]> => {
    const uploadedBlocks: EpubBlock[] = []
    let imageIndex = 0

    for (const block of blocks) {
        if (block.type !== "image" || !block.imageUri) {
            uploadedBlocks.push(block)
            continue
        }

        const imageUrl = await uploadChapterImage(
            bookId,
            chapterIndex,
            imageIndex,
            block.imageUri,
            uploadedPaths
        )
        imageIndex++

        if (!imageUrl) continue

        // Se descarta la ruta local: en el JSON publicado solo viaja la URL de Storage
        const uploadedBlock: EpubBlock = { ...block, imageUrl }
        delete uploadedBlock.imageUri
        uploadedBlocks.push(uploadedBlock)
    }

    return uploadedBlocks
}

/*
 * Arma los capitulos listos para publicar: sube sus imagenes a Storage y reemplaza
 * las rutas locales por URLs. Se hace ANTES de subir los JSON porque cada JSON
 * necesita las URLs ya conocidas dentro de sus bloques.
 */
const prepareChaptersForUpload = async (
    bookId: string,
    chapters: EpubChapter[],
    uploadedPaths: string[]
): Promise<PublishedChapter[]> => {
    const preparedChapters: PublishedChapter[] = []

    for (let index = 0; index < chapters.length; index++) {
        const chapter = chapters[index]
        const blocks = await uploadChapterImages(bookId, index, chapter.blocks, uploadedPaths)
        preparedChapters.push({ index, title: chapter.title, blocks })
    }

    return preparedChapters
}

/* Borra los archivos que se alcanzaron a subir. Si alguno no existe no pasa nada: se ignora */
const deleteUploadedFiles = async (paths: string[]) => {
    await Promise.allSettled(paths.map((path) => deleteObject(ref(storage, path))))
}

/**
 * Publica un libro: sube las imagenes de los capitulos y la portada a Cloud Storage,
 * despues los JSON de cada capitulo (que ya llevan las URLs de sus imagenes) y,
 * recien al final, escribe el documento del libro en Firestore.
 * Si algo falla en el medio, borra lo que ya se habia subido y tira el error.
 * @param params : datos del libro, ver PublishBookParams
 * @returns PublishBookResult : "published" o "duplicate" (con el id del libro)
 */
export const publishBook = async (params: PublishBookParams): Promise<PublishBookResult> => {
    const { authorId, authorName, book, synopsis, tags, coverJpegBase64, visibility } = params
    const bookId = buildPublishedBookId(authorId, book.title)
    const uploadedPaths: string[] = []

    try {
        const bookRef = doc(db, BOOKS_COLLECTION, bookId)

        // El id lleva el uid de quien publica: si ya existe, es un libro propio con el mismo titulo
        const existingBook = await getDoc(bookRef)
        if (existingBook.exists()) {
            return { status: "duplicate", bookId }
        }

        // Imagenes primero: los JSON de capitulo llevan las URLs ya resueltas dentro de sus bloques
        const preparedChapters = await prepareChaptersForUpload(bookId, book.chapters, uploadedPaths)

        // Capitulos: de a tandas, esperando que termine toda la tanda antes de seguir
        for (let start = 0; start < preparedChapters.length; start += UPLOAD_BATCH_SIZE) {
            const batch = preparedChapters.slice(start, start + UPLOAD_BATCH_SIZE)

            const uploads = batch.map((chapter) => {
                // La ruta se anota ANTES de subir, asi si falla justo ahi tambien se limpia
                uploadedPaths.push(buildChapterPath(bookId, chapter.index))
                return uploadChapter(bookId, chapter)
            })

            const results = await Promise.allSettled(uploads)
            const failedUpload = results.find((result) => result.status === "rejected")
            if (failedUpload && failedUpload.status === "rejected") {
                throw failedUpload.reason
            }
        }

        // Portada: se sube como imagen y en Firestore queda solo el link
        let coverUrl: string | null = null
        if (coverJpegBase64) {
            const coverPath = buildCoverPath(bookId)
            uploadedPaths.push(coverPath)
            const coverRef = ref(storage, coverPath)
            await uploadString(coverRef, coverJpegBase64, "base64", {
                contentType: JPEG_CONTENT_TYPE,
            })
            coverUrl = await getDownloadURL(coverRef)
        }

        const bookData: PublishedBookData = {
            authorId,
            authorName,
            title: book.title,
            titleKey: normalizeTitle(book.title),
            synopsis,
            tags,
            coverUrl,
            visibility,
            publishedAt: new Date().toISOString(),
            // Dato original del epub: se guarda pero no se muestra en la app (ver types/book.types.ts)
            originalAuthor: book.author,
            chapters: preparedChapters.map((chapter) => ({ index: chapter.index, title: chapter.title })),
        }

        // Esto va al final: asi el Home nunca ve un libro a medias
        await setDoc(bookRef, bookData)

        return { status: "published", bookId }
    } catch (error) {
        console.error("Error al publicar el libro:", error)
        await deleteUploadedFiles(uploadedPaths)
        throw new Error(handleFirebaseError(error))
    }
}