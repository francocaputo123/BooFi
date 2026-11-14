export type LibraryKind = 'library' | 'bookstore'

export type Library = {
    id: string
    name: string
    kind: LibraryKind
    address: string | null
    latitude: number
    longitude: number
    // Distancia en línea recta desde el usuario, en metros
    distanceMeters: number
}
