import { describe, expect, it } from "@jest/globals"
import { sortBooksByRating } from "@/utils/sortBooks"
import { makeBook } from "../helpers"

const idsOf = (ratings: (number | null)[], limitCount?: number) =>
    sortBooksByRating(
        ratings.map((rating, index) => makeBook({ id: `b${index}`, rating })),
        limitCount
    ).map((book) => book.id)

describe("sortBooksByRating (RF3.3)", () => {
    it("ordena de mayor a menor rating", () => {
        expect(idsOf([3.5, 4.9, 4.1])).toEqual(["b1", "b2", "b0"])
    })

    it("deja los libros sin rating al final", () => {
        expect(idsOf([null, 2.0, null, 5.0])).toEqual(["b3", "b1", "b0", "b2"])
    })

    it("con el mismo rating respeta el orden original", () => {
        expect(idsOf([4.5, 4.5, 4.5])).toEqual(["b0", "b1", "b2"])
    })

    it("si ninguno tiene rating, conserva el orden original", () => {
        expect(idsOf([null, null, null])).toEqual(["b0", "b1", "b2"])
    })

    it("acepta un rating de 0 y lo ordena antes que los null", () => {
        expect(idsOf([null, 0, 1])).toEqual(["b2", "b1", "b0"])
    })

    it("limita la cantidad de resultados", () => {
        expect(idsOf([1, 2, 3, 4, 5], 3)).toEqual(["b4", "b3", "b2"])
    })

    it("un limite mayor a la cantidad de libros devuelve todos", () => {
        expect(idsOf([1, 2], 10)).toEqual(["b1", "b0"])
    })

    it("un limite de 0 devuelve una lista vacia", () => {
        expect(idsOf([1, 2, 3], 0)).toEqual([])
    })

    it("una lista vacia devuelve una lista vacia", () => {
        expect(sortBooksByRating([])).toEqual([])
    })

    it("no modifica el arreglo original", () => {
        const books = [makeBook({ id: "a", rating: 1 }), makeBook({ id: "b", rating: 5 })]
        sortBooksByRating(books)
        expect(books.map((book) => book.id)).toEqual(["a", "b"])
    })
})
