import { describe, expect, it } from "@jest/globals"
import { parseRating } from "@/utils/parseRating"

describe("parseRating (RF3.3)", () => {
    it("acepta un rating valido", () => {
        expect(parseRating(4.8)).toBe(4.8)
    })

    it("acepta los extremos 0 y 5", () => {
        expect(parseRating(0)).toBe(0)
        expect(parseRating(5)).toBe(5)
    })

    it("redondea a un decimal", () => {
        expect(parseRating(4.84)).toBe(4.8)
        expect(parseRating(4.86)).toBe(4.9)
    })

    it("rechaza numeros fuera del rango 0 a 5", () => {
        expect(parseRating(-0.1)).toBeNull()
        expect(parseRating(5.1)).toBeNull()
        expect(parseRating(48)).toBeNull()
    })

    it("rechaza lo que no es un numero", () => {
        expect(parseRating("4.5")).toBeNull()
        expect(parseRating(null)).toBeNull()
        expect(parseRating(undefined)).toBeNull()
        expect(parseRating({})).toBeNull()
    })

    it("rechaza NaN e infinito", () => {
        expect(parseRating(NaN)).toBeNull()
        expect(parseRating(Infinity)).toBeNull()
    })
})
