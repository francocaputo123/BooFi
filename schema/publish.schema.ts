import z from "zod"
import { AVAILABLE_TAGS, MAX_PRICE_ARS, MAX_SYNOPSIS_LENGTH, MIN_PRICE_ARS } from "@/data/publishData"

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

/*
 * Precio de un libro de pago: entero en pesos, entre MIN_PRICE_ARS y MAX_PRICE_ARS.
 * Solo se valida cuando el autor elige "De pago".
 */
export const priceSchema = z
    .number({ message: "Ingresá el precio del libro" })
    .int("El precio tiene que ser en pesos enteros")
    .min(MIN_PRICE_ARS, `El precio mínimo es $${MIN_PRICE_ARS}`)
    .max(MAX_PRICE_ARS, `El precio máximo es $${MAX_PRICE_ARS}`)

export type PublishForm = z.infer<typeof publishFormSchema>