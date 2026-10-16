import z from "zod";

const readingProgressSchema = z.object({
    bookId: z.string().min(1),
    chapterIndex: z.number().int().min(0),
    scrollOffset: z.number().min(0),
    updatedAt: z.string()
})

// Los params de una ruta siempre llegan como string, por eso se validan antes de usarlos
const bookRouteParamsSchema = z.object({
    id: z.string().min(1, "Falta el id del libro")
})

export {readingProgressSchema, bookRouteParamsSchema}
