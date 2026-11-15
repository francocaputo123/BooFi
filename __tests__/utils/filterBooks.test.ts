import { describe, expect, it } from "@jest/globals"
import { filterBooks } from "@/utils/filterBooks"
import { makeBook } from "../helpers"

const BOOKS = [
    makeBook({ id: "1", title: "El Hobbit", authorName: "J.R.R. Tolkien", tags: ["Fantasía", "Aventura"] }),
    makeBook({ id: "2", title: "Cien años de soledad", authorName: "Gabriel García Márquez", tags: ["Drama"] }),
    makeBook({ id: "3", title: "El libro troll", authorName: "Rubius", tags: [] }),
]

const idsOf = (searchText: string, genre: string | null = null) =>
    filterBooks(BOOKS, { searchText, genre }).map((book) => book.id)

describe("filterBooks (RF3.1 y RF3.2)", () => {
    it("sin filtros devuelve todos los libros", () => {
        expect(idsOf("")).toEqual(["1", "2", "3"])
    })

    it("no distingue mayusculas ni minusculas", () => {
        expect(idsOf("HOBBIT")).toEqual(["1"])
    })

    it("ignora las tildes: 'garcia' encuentra a García", () => {
        expect(idsOf("garcia")).toEqual(["2"])
    })

    it("ignora espacios de mas", () => {
        expect(idsOf("  gabriel   garcia ")).toEqual(["2"])
    })

    it("busca tambien por autor", () => {
        expect(idsOf("tolkien")).toEqual(["1"])
    })

    it("devuelve vacio cuando nada coincide", () => {
        expect(idsOf("zzzz")).toEqual([])
    })

    it("filtra por genero", () => {
        expect(idsOf("", "Fantasía")).toEqual(["1"])
    })

    it("un genero sin libros devuelve vacio", () => {
        expect(idsOf("", "Terror")).toEqual([])
    })

    it("combina texto y genero: tienen que cumplirse los dos", () => {
        expect(idsOf("el", "Fantasía")).toEqual(["1"])
        expect(idsOf("troll", "Fantasía")).toEqual([])
    })

    it("no modifica la lista original", () => {
        const copy = [...BOOKS]
        filterBooks(BOOKS, { searchText: "hobbit", genre: null })
        expect(BOOKS).toEqual(copy)
    })
})
