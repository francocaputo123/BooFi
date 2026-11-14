/**
 * Da formato de pesos argentinos a un precio entero: 1500 -> "$1.500".
 * Se arma a mano (en vez de usar Intl) para que ande igual en todos los celulares.
 * @param price : precio en pesos enteros
 * @returns string : precio con puntos de miles y signo $
 */
export const formatPrice = (price: number): string => {
    return `$${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
}
