/* Configuracion de pruebas automaticas (Jest). Solo busca archivos *.test.ts(x) dentro de __tests__/ */
module.exports = {
    preset: "jest-expo",
    testMatch: ["<rootDir>/__tests__/**/*.test.(ts|tsx)"],
    // Permite que las pruebas usen los mismos imports "@/..." que el codigo de la app
    moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
}
