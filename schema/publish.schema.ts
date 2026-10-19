import z from "zod"
import { AVAILABLE_TAGS, MAX_SYNOPSIS_LENGTH } from "@/data/publishData"

/*
 * Validacion del formulario de publicacion.
 * "tags" es un subconjunto no vacio de la lista cerrada; "synopsis" respeta el largo maximo
 * que acepta el campo en Firestore.
 */
export const publishFormSchema = z.object({
    tags: z
        .array(z.enum(AVAILABLE_TAGS))
        .min(1, "Elegí al menos una categoría"),
    synopsis: z
        .string()
        .trim()
        .min(1, "La sinopsis no puede estar vacía")
        .max(
            MAX_SYNOPSIS_LENGTH,
            `La sinopsis no puede superar los ${MAX_SYNOPSIS_LENGTH} caracteres`
        ),
})

export type PublishForm = z.infer<typeof publishFormSchema>