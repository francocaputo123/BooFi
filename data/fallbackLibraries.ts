import { Coords } from "@/types/location.types"

export type FallbackLibrary = {
    id: string
    name: string
    address: string
    locality: string
    // Opcionales: si se cargan, se usan tal cual y no se geocodifica la dirección.
    // Se pueden copiar desde Google Maps (clic derecho sobre el lugar) para tener el pin exacto.
    latitude?: number
    longitude?: number
}

// Punto de referencia de la lista: Universidad Nacional de Pilar
export const FALLBACK_REFERENCE_POINT: Coords = {
    latitude: -34.43734422559157,
    longitude: -58.89272440292547,
}

// Radio que cubre la lista (20 km) más un margen, porque el geocodificador no es exacto.
// Si una dirección cae más lejos que esto, se asume que el geocodificador encontró otra calle
// con el mismo nombre en otra ciudad y se descarta.
export const FALLBACK_MAX_DISTANCE_METERS = 25000

// Cuántas direcciones se geocodifican a la vez (en iOS, demasiados pedidos juntos se bloquean)
export const FALLBACK_GEOCODE_CONCURRENCY = 4

/*
 * Librerías (venta de libros y material de librería) en un radio de ~20 km de la UNPi.
 * Lista de respaldo: se usa solo cuando falla la consulta a OpenStreetMap.
 * NOTE: datos tomados de directorios comerciales (argentino.com.ar, Cylex, Licuo, redargentina y
 * sitios de los propios comercios). Pueden estar desactualizados: conviene verificar que sigan abiertas.
 */
export const FALLBACK_LIBRARIES: FallbackLibrary[] = [
    // Pilar
    { id: 'pilar-acuarela', name: 'Acuarela Librería', address: 'Uruguay 1196', locality: 'Pilar' },
    { id: 'pilar-oasis', name: 'Librería Oasis', address: 'Rivadavia 539', locality: 'Pilar' },
    { id: 'pilar-venecia', name: 'Librería Venecia', address: 'Estanislao López 557', locality: 'Pilar' },
    { id: 'pilar-orange', name: 'Orange Librería', address: 'Champagnat 870', locality: 'Pilar' },
    { id: 'pilar-todo-libro', name: 'Todo Libro', address: 'Ituzaingó 636', locality: 'Pilar' },
    { id: 'pilar-estacion-libro', name: 'Estación Libro', address: 'Las Magnolias 754', locality: 'Pilar' },
    { id: 'pilar-lapiz-y-papel', name: 'Lápiz y Papel', address: 'Pedro Lagrave 260', locality: 'Pilar' },
    { id: 'pilar-del-pilar', name: 'Librería del Pilar', address: 'Pedro Lagrave 423', locality: 'Pilar' },
    { id: 'pilar-hora-libre', name: 'Librería Hora Libre', address: 'Independencia 684', locality: 'Pilar' },
    { id: 'pilar-caki', name: 'Librerías Caki', address: '11 de Septiembre 632', locality: 'Pilar' },
    { id: 'pilar-santa-rita', name: 'Librería Santa Rita', address: 'Sanguinetti 214', locality: 'Pilar' },
    { id: 'pilar-casa-ignacio', name: 'Casa Ignacio', address: 'Chacabuco 588', locality: 'Pilar' },
    { id: 'pilar-pepeluchos', name: 'Pepeluchos', address: 'Hipólito Yrigoyen 607', locality: 'Pilar' },
    { id: 'pilar-org-escolar-san-miguel', name: 'Organización Escolar San Miguel', address: 'Ituzaingó 635', locality: 'Pilar' },

    // Villa Rosa, Del Viso y Presidente Derqui
    { id: 'villa-rosa-cueva-estudiante', name: 'La Cueva del Estudiante', address: 'Esteban Gascón 2333', locality: 'Villa Rosa' },
    { id: 'del-viso-las-marias', name: 'Almacén Didáctico Las Marías', address: 'Los Alerces 1691', locality: 'Del Viso' },
    { id: 'derqui-mis-angeles', name: 'Mis Ángeles Librería Cotillón Papelera', address: 'Avenida Derqui 6489', locality: 'Presidente Derqui' },

    // José C. Paz
    { id: 'jcp-libreria-ocho', name: 'Librería Ocho', address: 'Avenida Presidente Arturo Umberto Illia 6395', locality: 'José C. Paz' },
    { id: 'jcp-de-fuego', name: 'Librería de Fuego', address: 'Avenida Croacia 2622', locality: 'José C. Paz' },
    { id: 'jcp-sin-rival', name: 'Sin Rival', address: 'Avenida Hipólito Yrigoyen 1732', locality: 'José C. Paz' },
    { id: 'jcp-la-artistica', name: 'La Artística', address: 'Zuviría 4933', locality: 'José C. Paz' },
    { id: 'jcp-unpaz', name: 'Librería Universitaria UNPAZ', address: 'Leandro N. Alem 4673', locality: 'José C. Paz' },

    // Belén de Escobar
    { id: 'escobar-libreria-escobar', name: 'Librería Escobar', address: 'Edilfredo Ameghino 788', locality: 'Belén de Escobar' },
    { id: 'escobar-el-pibe', name: 'El Pibe Librería', address: 'Spadaccini 986', locality: 'Belén de Escobar' },
    { id: 'escobar-su-libreria', name: 'Su Librería', address: 'Spadaccini 1013', locality: 'Belén de Escobar' },
    { id: 'escobar-el-verbo', name: 'Librería Cristiana El Verbo', address: 'Estrada 1109', locality: 'Belén de Escobar' },
    { id: 'escobar-lapiz-papel-tijera', name: 'Lápiz Papel o Tijera', address: 'Avenida San Martín 560', locality: 'Belén de Escobar' },
]
