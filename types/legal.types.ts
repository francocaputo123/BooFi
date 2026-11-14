// Un bloque de texto: un string es un párrafo; un array de strings es una lista con viñetas
export type LegalBlock = string | string[]

export type LegalSection = {
    heading: string
    blocks: LegalBlock[]
}

export type LegalDocument = {
    title: string
    lastUpdated: string
    intro: string[]
    sections: LegalSection[]
}

export type LegalDocumentKey = 'terms' | 'privacy'
