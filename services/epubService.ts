import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import * as FileSystem from "expo-file-system/legacy";
import { EpubChapter, EpubParsedBook, FileValidationResult } from "../types/epub.types";
import { isValid } from "zod/v3";

/* Lo capeo a 20mb, despues lo cambio */
const MAX_EPUB_SIZE_BYTES = 20 * 1024 * 1024;

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

    const spineItemRefs = normalizeToArray(packageNode.spine.itemref);
    const chapters: EpubChapter[] = [];

    for (const itemRef of spineItemRefs) {
        const manifestItem = manifestById[itemRef["@_idref"]];
        if (!manifestItem) continue;

        const chapterPath = opfDir + manifestItem.href;

        try {
            const chapterHtml = await readZipFileAsText(zip, chapterPath);
            const chapterText = stripHtmlTags(chapterHtml);

            chapters.push({
                id: itemRef["@_idref"],
                title: guessChapterTitle(chapterHtml, manifestItem.href),
                href: manifestItem.href,
                textPreview: chapterText.substring(0, 200),
            });
        } catch (error) {
            /* Manejo de error, si un cap no se lee salta al siguiente */
        continue;
        }
    }

    if (chapters.length === 0) {
        throw new Error("No se pudo extraer ningún capítulo del archivo");
    }

    return { title: String(title), author: String(author), chapters };
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
 * Heurística simple: si el capítulo tiene un <h1>/<h2>/<h3>, lo usamos como
 */
const guessChapterTitle = (chapterHtml: string, fallbackFileName: string): string => {
    const headingMatch = chapterHtml.match(/<h[1-3][^>]>(.?)<\/h[1-3]>/i);
    if (headingMatch) {
        return stripHtmlTags(headingMatch[1]);
    }
    return fallbackFileName.replace(/\.[^/.]+$/, "");
};
