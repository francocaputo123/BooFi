# BooFi

> **BooFi** es una aplicación móvil orientada a la creación de libros de todo tipo, tanto de manera profesional como amateur. Los creadores pueden publicar sus obras de manera gratuita y también paga permitiéndoles generar ganancias por venta.

## Características principales

- **Publicaciones flexibles:** Opciones de publicación gratuita o de manera paga.
- **Monetización para creadores:** Generación de ingresos por venta.
- **Comunidad:** Interacción entre creadores y lectores de manera directa.

## Features

### Cuenta

|Feature|
|-------|
|Creación y edición de cuenta personal|
|Perfil personalizable|
|Guardados de libros en favoritos|
|Sección de libros comprados|

### Navegación principal

|Feature|
|-------|
|Recomendación de libros según gustos previamente preguntados|
|Filtros personalizables para una mejor búesqueda|
|Barra de búsqueda por libro o autor|


### Editor

|Feature|
|-------|
|Visualización de todos los libros creados|
|Editor simple|

### Carrito (a definir)

|Feature|
|-------|
|Visuzalicación de los libros que el usuario quiera comprar|
|Transacción mediante la api de MP|

## Tecnologías y Stack

> Para este proyecto se van a utilizar las tecnologías dadas por el profesor de la materia.

|Capa|Tecnología|
|----|----------|
|Diseño|Escalidraw para mockup y Figma para prototipo| 
|Build|Expo SDK, Expo GO| 
|UI|React Native con TypeScript|
|Lógica y backend|Firebase backend|
|DB|Firebase db|

## Organización del proyecto

```
BooFi/
├── app/ # Rutas de expo
    ├── (tabs)
        ├── profile.tsx
        ...
    ├── constants / # Contantes de colores, tipografía, spacing
        ├── theme.ts 
    ├── components
        ├── ui/ # Reutilizables como botones, inputs genéricos 
        ├── Card.tsx # Otros componentes de dominio
    ├── types/
       ├── index.ts # Interfaces de ts
    ├── hooks/ # Hooks personalizados
    ├── services/ # Llamadas a apis
    ├── data/ # Archivos de prueba o data interna de componentes
```

## Estándares y convenciones de código

> Vamos a usar las prácticas mayormente utilizadas y basándonos del repositorio oficial de TS: https://github.com/microsoft/TypeScript/wiki/Coding-guidelines

**Estructura de componentes**

- Todo componente internamente debe estar definido mediante arrow function y exportarlo al final del mismo
  
```
const Profile = () => {
    ....
}

export default Profile
```

- Estilo modular definido al final de cada componente

**Nomenclatura**

- Uso obligatorio del inglés para en todo el proyecto a excepción de los comentarios para los desarrolladores
- Toda pantalla y componente debe utilizar PascalCase: ProfileCard.tsx, HomeScreen.tsx, etc
- Toda función y hook debe ir en camelCase: fetchBook, useCart, etc
- Las constantes deben ir SIEMPRE en mayúscula y diferenciando los espacios con "_" : SPACING, THEME_COLORS, etc
- Usar frases completas y descriptivas para la definición de variables, componentes, pantallas, etc. NO usar números ni otros símbolos especiales:
    - *MAL* : userdat, 1item, profile_card 
    - *BIEN* : userData, useProfileData

**Manejo de errores y estados obligatorios**

- Cualquier función o dato asíncrono debe estar respectivamente envuelto en un try/catch para evitar errores. Agregar finnaly de ser necesario:

```
try {
    const data = await axios(...)
    ....
} catch(error) {
    if(error) {
        setError("...")
    }
} finally {
    setLoading(false)
}
```

- Los componentes deben mínimamente utilizar estados de: Loading, Error y Data; para mejorar el desarrollo y la UI para el usuario.

**Comentarios**

> Todo comentario dentro del código debe ser descriptivo. Deben explicar el porque de una decisión y no el qué hace el código. Evitar explicar código redundante. El código en sí mimso debe ser explicativo

**Etiquetas especiales**

- TODO: tarea pentiende o mejora a realizar
- NOTE: aclaración importante sobre el sistema
- FIXME: error o bug conocido que requiere arreglo

**Estructura de comentario**

> Se utliza el estandar de JSDoc para comentar. Este usa bloques que empiezan con /** */ permitiendo poder visualizarlos más adelante por ejemplo dentro de vs code.

EJemplo de uso:

```
/**
    Suma dos núneros enteros
    @param number a : primer número
    @param number b : segundo número
    @returns number : total
*/

function sum(a,b) {
    return a + b
}
```

## Flujo de trabajo (GIT)

- Ramas principales
    - main: rama principal del proyecto. NO se hace push directamente en esta rama ya que contiene los cambios finales que van directamente a producción.
    - develop : rama de integración y desarrollo. Antes de pushear los cambios a main, se integran en esta rama para testear posibles errores o conflictos de merge

- Ramas secundarias
    - feature/nombre-funcionalidad: cualquier nueva funcionalidad en la que se este trabajando debe nombrarse de esta manera. Se crea directamente a partir de la rama develop que contiene todos los últimos cambios hechos en el repositorio.

- Mensajes de commit
    - Formato: feat(scope) : descripción en minúsculas.
    - Mensaje: descriptivo y uso del presente. No usar verbos en pasado o futuro.
    - feat : nueva funcionalidad, ejemplo: feat : agregado carrito de compras 
    - fix : corrección de errores, ejemplo : fix : precio no se actualiza en editar
    - style : cambios estéticos, ejemplo : style : ordenar imports
    - format : mejoras en el código sin afectar la funcionalidad del mismo, ejemplo : refactor : lógica extrída de profile a useProfiler

- Reglas de commits
    - Todos los pull requests van directo a la rama develop. Deben llevar una descripción de los cambios hechos y porqué. Serán revisados por el Scrum Master para ser aceptados.
    - Ejemplo de un buen commit:
   ```
   Título: feat: carrito de compras

   - Implementación de carrito de compras
   - UI y estado global
   ```

## Guía de instalación

**Prerrequisitos**
- Node.js 20
- npm
- Expo GO (móvil)

**Instalación**
1. git clone
2. npm install | npm i
3. npm expo start

## Colaboradores

- Facundo Bellochi
- Gian Franco Miguel Caputo
- Enzo Silva
- Julián Dalmazzo
- Santiago Leffler
- Thiago Alegre
- Esteban Nuñez
