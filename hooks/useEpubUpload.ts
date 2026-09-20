import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { validateEpubFile, parseEpubFile } from "../services/epubService";
import { EpubParsedBook } from "../types/epub.types";

export type UploadStatus = "idle" | "loading" | "success" | "error";

/*
 * Hook que maneja todo el flujo de subir un .epub:
 * 1) abrir el selector de archivos del dispositivo
 * 2) validar extension/tamaño
 * 3) parsear el contenido
 * 4) devolver el resultado (exito o error)
 */
export const useEpubUpload = () => {
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [parsedBook, setParsedBook] = useState<EpubParsedBook | null>(null);

    const pickAndUploadEpub = async () => {
        setErrorMessage(null);
        setParsedBook(null);

        try {
            const pickerResult = await DocumentPicker.getDocumentAsync({
                type: ["application/epub+zip"],
                copyToCacheDirectory: true,
            });
      
            if (pickerResult.canceled) {
                return;
            }

            const pickedFile = pickerResult.assets[0];
            setStatus("loading");

            const validation = validateEpubFile(pickedFile.name, pickedFile.size ?? 0);
            if (!validation.isValid) {
                setStatus("error");
                setErrorMessage(validation.errorMessage ?? "Archivo inválido");
                return;
            }

            const book = await parseEpubFile(pickedFile.uri);
            setParsedBook(book);
            setStatus("success");
        } catch (error) {
            console.error("Error al procesar el epub:", error);
            setStatus("error");
            setErrorMessage("Ocurrió un error al procesar el archivo. Probá con otro .epub.");
        }
    };

    return { status, errorMessage, parsedBook, pickAndUploadEpub };
};