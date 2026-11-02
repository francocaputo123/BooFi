/**
 * Corta la espera de una promesa si tarda demasiado.
 * Sirve para que una red lenta no deje la pantalla cargando para siempre.
 * @param promise : operación a esperar
 * @param timeoutMs : tiempo máximo de espera en milisegundos
 * @returns el resultado de la promesa, o un error si se pasó el tiempo
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        const timerId = setTimeout(() => reject(new Error("Tiempo de espera agotado")), timeoutMs)

        promise
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timerId))
    })
}
