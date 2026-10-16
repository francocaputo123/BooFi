import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import * as FileSystem from "expo-file-system/legacy";
import { EpubBlock, EpubChapter, EpubParsedBook, FileValidationResult } from "../types/epub.types";
import { buildBookId } from "../utils/buildBookId";
import { MAX_SYNOPSIS_LENGTH } from "../data/publishData";
import { parseCssRules } from "../utils/epubCss";
import { getImageSize } from "../utils/imageSize";
import { blocksToPlainText, decodeHtmlEntities, parseChapterHtml } from "../utils/epubHtmlParser";

/* Lo capeo a 20mb, despues lo cambio */
const MAX_EPUB_SIZE_BYTES = 20 * 1024 * 1024;

/* Formatos de imagen que aceptamos como portada, con la extension del archivo temporal */
const COVER_EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
};

/* Extensiones de imagen que el lector sabe mostrar (los .svg sueltos no se pueden) */
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

/*
 * Valida el archivo elegido por el usuario ANTES de intentar leerlo/procesarlo.
 * Solo mira nombre (extension) y tamaño, es una validacion rapida y barata
 */
export const validateEpubFile = (
    fileName: string,
    fileSizeBytes: number
    ): FileValidationResult => {
        const hasEpubExtension = fileName.toLowerCase().endsWith(".epub");

    if (!hasEpubExtension) {
        return {
            isValid: false,
            errorMessage: "El archivo debe tener extensión .epub",
        };
    }

    if (fileSizeBytes > MAX_EPUB_SIZE_BYTES) {
        const maxMb = MAX_EPUB_SIZE_BYTES / (1024 * 1024);
        return {
            isValid: false,
            errorMessage: `El archivo supera el tamaño máximo permitido (${maxMb}MB)`,
        };
    }

    return { isValid: true };
};

/*
 * Lee un .epub desde el dispositivo y extrae titulo, autor y capitulos.
 * Un .epub es un .zip, siguiendo esta teoria se usa jszip para abrirlo
 * y fast-xml-parser para leer los XML que describen el libro.
 */

export const parseEpubFile = async (
    fileUri: string
): Promise<EpubParsedBook> => {
    const base64Content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
    });


    const zip = await JSZip.loadAsync(base64Content, { base64: true });
    const opfPath = await findOpfPath(zip);
    const opfDir = opfPath.includes("/")
        ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1)
        : "";

    const opfXml = await readZipFileAsText(zip, opfPath);
    const xmlParser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
    });
    const opfData = xmlParser.parse(opfXml);
    const packageNode = opfData.package;

    const title = extractFirstValue(packageNode.metadata["dc:title"]) ?? "Sin título";
    const author = extractFirstValue(packageNode.metadata["dc:creator"]) ?? "Autor desconocido";

    const manifestItems = normalizeToArray(packageNode.manifest.item);
    const manifestById: Record<string, { href: string; mediaType: string }> = {};
    manifestItems.forEach((item: any) => {
        manifestById[item["@_id"]] = {
            href: item["@_href"],
            mediaType: item["@_media-type"],
        };
    });

    // Las hojas de estilo definen la negrita/cursiva/alineacion de muchos epubs (ej: los de Calibre)
    const cssRules = await loadCssRules(zip, opfDir, manifestItems);

    const spineItemRefs = normalizeToArray(packageNode.spine.itemref);
    const chapters: EpubChapter[] = [];
    // Una misma imagen puede aparecer varias veces en el libro: se saca del zip una sola vez
    const imageCache = new Map<string, EpubImageFile | null>();
    const bookId = buildBookId(String(title), String(author));
    // Se registra cada archivo que no llega a ser capitulo; antes se salteaban en silencio y no habia como saber por que
    const skippedItems: string[] = [];

    for (const itemRef of spineItemRefs) {
        const idref = itemRef["@_idref"];
        const manifestItem = manifestById[idref];
        if (!manifestItem) {
            skippedItems.push(`${idref} (no esta en el manifest)`);
            continue;
        }

        try {
            const chapterFile = findZipFile(zip, opfDir, manifestItem.href);
            if (!chapterFile) {
                skippedItems.push(`${manifestItem.href} (no se encontro dentro del .epub)`);
                continue;
            }

            const chapterHtml = await chapterFile.async("text");
            const parsedBlocks = parseChapterHtml(chapterHtml, cssRules);
            const blocks = await resolveChapterImages(zip, opfDir, manifestItem.href, parsedBlocks, imageCache, bookId);

            // Una pagina sin texto ni imagenes legibles daria un capitulo en blanco
            if (blocks.length === 0) {
                skippedItems.push(`${manifestItem.href} (sin contenido)`);
                continue;
            }

            // La primera pagina que es solo una imagen es la portada: se le pone nombre en vez del nombre del archivo
            const isImageOnly = blocks.every((block) => block.type === "image");
            const chapterTitle =
                isImageOnly && chapters.length === 0
                    ? "Portada"
                    : guessChapterTitle(chapterHtml, manifestItem.href);

            chapters.push({
                id: idref,
                title: chapterTitle,
                href: manifestItem.href,
                textPreview: blocksToPlainText(blocks).substring(0, 200),
                blocks,
            });
        } catch (error) {
            skippedItems.push(`${manifestItem.href} (error al leerlo: ${String(error)})`);
        }
    }

    if (skippedItems.length > 0) {
        console.warn(
            `[epubService] El spine tiene ${spineItemRefs.length} archivos y se cargaron ${chapters.length} capitulos. Salteados:\n- ${skippedItems.join("\n- ")}`
        );
    }

    if (chapters.length === 0) {
        throw new Error("No se pudo extraer ningún capítulo del archivo");
    }

    const coverUri = await extractCoverUri(zip, opfDir, findCoverManifestItem(packageNode, manifestItems), bookId);

    return {
        id: bookId,
        title: String(title),
        author: String(author),
        synopsis: extractSynopsis(packageNode.metadata),
        coverUri,
        chapters,
    };
};

const findOpfPath = async (zip: JSZip): Promise<string> => {
    const containerXml = await readZipFileAsText(zip, "META-INF/container.xml");
    const xmlParser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
    });
    const containerData = xmlParser.parse(containerXml);
    const rootfile = containerData.container.rootfiles.rootfile;
    const rootfileNode = Array.isArray(rootfile) ? rootfile[0] : rootfile;
    return rootfileNode["@_full-path"];
};

const readZipFileAsText = async (zip: JSZip, path: string): Promise<string> => {
    const file = zip.file(path);
    if (!file) {
    throw new Error(`No se encontró el archivo "${path}" dentro del .epub`);
    }
    return file.async("text");
};

/*
 * Si el libro tiene un author pasa como string, si tiene varios pasa como array
 */
const extractFirstValue = (value: any): string | undefined => {
    if (value === undefined || value === null) return undefined;
    const first = Array.isArray(value) ? value[0] : value;
    return typeof first === "object" ? first["#text"] : String(first);
};

const normalizeToArray = (value: any): any[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

/*
 * Resuelve "./" y "../" de una ruta dentro del zip (ej: "OEBPS/../Text/a.xhtml" -> "Text/a.xhtml").
 */
const normalizeZipPath = (path: string): string => {
    const parts: string[] = [];
    for (const segment of path.split("/")) {
        if (segment === "" || segment === ".") continue;
        if (segment === "..") {
            parts.pop();
            continue;
        }
        parts.push(segment);
    }
    return parts.join("/");
};

const safeDecodeUri = (value: string): string => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const normalizeForCompare = (path: string): string => path.normalize("NFC").toLowerCase();

/*
 * Busca un archivo del manifest dentro del zip. Los href vienen codificados como URL
 * ("Cap%C3%ADtulo%201.xhtml"), pueden traer "#ancla" o "../", y a veces no coinciden en
 * mayusculas/acentos con el nombre real; con zip.file(href) a secas todos esos capitulos "no existian".
 */
const findZipFile = (zip: JSZip, opfDir: string, href: string): JSZip.JSZipObject | null => {
    const hrefWithoutAnchor = href.split("#")[0];

    for (const candidate of [hrefWithoutAnchor, safeDecodeUri(hrefWithoutAnchor)]) {
        const file = zip.file(normalizeZipPath(opfDir + candidate));
        if (file) return file;
    }

    const target = normalizeForCompare(normalizeZipPath(opfDir + safeDecodeUri(hrefWithoutAnchor)));
    const matchingName = Object.keys(zip.files).find((name) => normalizeForCompare(name) === target);
    return matchingName ? zip.file(matchingName) : null;
};

const loadCssRules = async (zip: JSZip, opfDir: string, manifestItems: any[]) => {
    let allCss = "";

    for (const item of manifestItems) {
        if (item["@_media-type"] !== "text/css") continue;
        try {
            const cssFile = findZipFile(zip, opfDir, item["@_href"]);
            if (cssFile) allCss += "\n" + (await cssFile.async("text"));
        } catch {
            // Un CSS ilegible no debe impedir leer el libro: se sigue sin esas reglas
        }
    }

    return parseCssRules(allCss);
};

/*
 * Heurística simple: si el capítulo tiene un <h1>/<h2>/<h3> con texto, lo usamos como título.
 * Si no, se usa el nombre del archivo.
 */
const guessChapterTitle = (chapterHtml: string, fallbackHref: string): string => {
    const headingMatch = chapterHtml.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    if (headingMatch) {
        const headingText = decodeHtmlEntities(stripHtmlTags(headingMatch[1]));
        if (headingText) return headingText;
    }
    return titleFromFileName(fallbackHref);
};

/*
 * Arma un titulo legible a partir de la ruta del archivo: "Text/Cap%C3%ADtulo_3.xhtml" -> "Capítulo 3".
 * Se queda solo con el nombre (sin la carpeta "Text/"), decodifica los %XX y saca la extension.
 */
const titleFromFileName = (href: string): string => {
    const hrefWithoutAnchor = href.split("#")[0];
    const fileName = safeDecodeUri(hrefWithoutAnchor).split("/").pop() ?? hrefWithoutAnchor;
    const readableName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
    return readableName || "Sin título";
};

/*
 * La sinopsis esta en dc:description. Muchos epubs la traen con etiquetas HTML adentro,
 * asi que se limpian y se corta si es demasiado larga.
 */
const extractSynopsis = (metadata: any): string => {
    const rawDescription = extractFirstValue(metadata["dc:description"]);
    if (!rawDescription) return "";

    const text = decodeHtmlEntities(stripHtmlTags(String(rawDescription)));
    if (text.length <= MAX_SYNOPSIS_LENGTH) return text;

    return text.substring(0, MAX_SYNOPSIS_LENGTH - 1).trimEnd() + "…";
};

/*
 * Busca en el manifest cual es la imagen de portada. Cada version del formato lo marca distinto:
 * 1) EPUB 3: el item tiene properties="cover-image"
 * 2) EPUB 2: un <meta name="cover" content="id-del-item"> en los metadatos
 * 3) Si ninguno esta, una imagen cuyo id o nombre diga "cover"
 */
const findCoverManifestItem = (packageNode: any, manifestItems: any[]): any | undefined => {
    const isSupportedImage = (item: any) => Boolean(COVER_EXTENSIONS[item["@_media-type"]]);

    const itemByProperty = manifestItems.find(
        (item) =>
            isSupportedImage(item) &&
            String(item["@_properties"] ?? "").split(/\s+/).includes("cover-image")
    );
    if (itemByProperty) return itemByProperty;

    const coverMeta = normalizeToArray(packageNode.metadata.meta).find(
        (meta: any) => meta["@_name"] === "cover"
    );
    if (coverMeta) {
        const itemById = manifestItems.find(
            (item) => item["@_id"] === coverMeta["@_content"] && isSupportedImage(item)
        );
        if (itemById) return itemById;
    }

    return manifestItems.find(
        (item) => isSupportedImage(item) && /cover/i.test(`${item["@_id"]} ${item["@_href"]}`)
    );
};

/*
 * Saca la portada del zip y la deja como archivo temporal en el celu (todavia sin achicar).
 * Una portada que no se puede leer NO frena la carga del libro: simplemente queda sin portada.
 */
const extractCoverUri = async (
    zip: JSZip,
    opfDir: string,
    coverItem: any | undefined,
    bookId: string
): Promise<string | null> => {
    if (!coverItem || !FileSystem.cacheDirectory) return null;

    try {
        const coverFile = findZipFile(zip, opfDir, coverItem["@_href"]);
        if (!coverFile) return null;

        const coverBase64 = await coverFile.async("base64");
        const extension = COVER_EXTENSIONS[coverItem["@_media-type"]];
        const coverUri = `${FileSystem.cacheDirectory}cover-${bookId}.${extension}`;

        await FileSystem.writeAsStringAsync(coverUri, coverBase64, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return coverUri;
    } catch (error) {
        console.warn("[epubService] No se pudo leer la portada:", error);
        return null;
    }
};

/* Una imagen del epub ya guardada como archivo en el celu, con sus medidas si se pudieron leer */
interface EpubImageFile {
    uri: string;
    width?: number;
    height?: number;
}

/*
 * Saca una imagen del zip y la deja como archivo temporal en el celu (sin achicar todavia).
 * Devuelve null si no se puede mostrar: es externa (http), viene embebida (data:), es un .svg suelto,
 * no esta dentro del .epub o fallo la lectura. Una imagen que falla NO frena la carga del libro.
 */
const extractImageFile = async (
    zip: JSZip,
    opfDir: string,
    chapterHref: string,
    imageHref: string,
    imageCache: Map<string, EpubImageFile | null>,
    bookId: string
): Promise<EpubImageFile | null> => {
    if (/^(data:|https?:|\/\/)/i.test(imageHref) || !FileSystem.cacheDirectory) return null;

    // La ruta de la imagen es relativa a la carpeta del capitulo que la usa (ej: "../Images/foto.jpg")
    const chapterDir = chapterHref.includes("/") ? chapterHref.substring(0, chapterHref.lastIndexOf("/") + 1) : "";
    const hrefFromOpf = chapterDir + imageHref.split("#")[0];

    const cacheKey = normalizeForCompare(normalizeZipPath(opfDir + safeDecodeUri(hrefFromOpf)));
    const cachedImage = imageCache.get(cacheKey);
    if (cachedImage !== undefined) return cachedImage;

    let imageFile: EpubImageFile | null = null;
    try {
        const extension = safeDecodeUri(hrefFromOpf).split(".").pop()?.toLowerCase() ?? "";
        const zipFile = IMAGE_EXTENSIONS.includes(extension) ? findZipFile(zip, opfDir, hrefFromOpf) : null;

        if (zipFile) {
            const size = getImageSize(await zipFile.async("uint8array"));
            const imageBase64 = await zipFile.async("base64");
            const imageUri = `${FileSystem.cacheDirectory}img-${bookId}-${imageCache.size}.${extension}`;

            await FileSystem.writeAsStringAsync(imageUri, imageBase64, {
                encoding: FileSystem.EncodingType.Base64,
            });
            imageFile = { uri: imageUri, width: size?.width, height: size?.height };
        }
    } catch (error) {
        console.warn("[epubService] No se pudo leer una imagen:", imageHref, error);
    }

    imageCache.set(cacheKey, imageFile);
    return imageFile;
};

/*
 * Reemplaza en los bloques de imagen la ruta original (imageHref) por el archivo ya guardado en el celu.
 * Los bloques de imagen que no se pueden leer se descartan.
 */
const resolveChapterImages = async (
    zip: JSZip,
    opfDir: string,
    chapterHref: string,
    blocks: EpubBlock[],
    imageCache: Map<string, EpubImageFile | null>,
    bookId: string
): Promise<EpubBlock[]> => {
    const resolvedBlocks: EpubBlock[] = [];

    for (const block of blocks) {
        if (block.type !== "image") {
            resolvedBlocks.push(block);
            continue;
        }

        const { imageHref, ...imageBlock } = block;
        const imageFile = imageHref
            ? await extractImageFile(zip, opfDir, chapterHref, imageHref, imageCache, bookId)
            : null;
        if (!imageFile) continue;

        imageBlock.imageUri = imageFile.uri;
        if (imageFile.width && imageFile.height) {
            imageBlock.imageWidth = imageFile.width;
            imageBlock.imageHeight = imageFile.height;
        }
        resolvedBlocks.push(imageBlock);
    }

    return resolvedBlocks;
};