import { EpubBlock, EpubChapter, EpubParsedBook } from "./epub.types";

/*
 * Punto de lectura de un usuario dentro de un libro.
 * "scrollOffset" son los pixeles recorridos dentro del capitulo actual.
 */
export interface ReadingProgress {
    bookId: string;
    chapterIndex: number;
    scrollOffset: number;
    updatedAt: string;
}

/* Lo que informa el lector al guardar; "bookId" y "updatedAt" los completa el hook */
export type ReadingPosition = Pick<ReadingProgress, "chapterIndex" | "scrollOffset">;

export interface ReadingState {
    /* La clave combina usuario + libro (ver buildProgressKey) */
    progressByKey: Record<string, ReadingProgress>;
    setProgress: (key: string, progress: ReadingProgress) => void;
}

/*
 * Capitulos vecinos al actual. "null" significa que no existe
 * (estamos en el primero o en el ultimo), asi la UI sabe que debe deshabilitar el control.
 */
export interface ChapterNavigation {
    previousIndex: number | null;
    nextIndex: number | null;
}

export interface ReaderScreenParams {
    id?: string;
}

export interface ChapterReaderProps {
    book: EpubParsedBook;
    /* Solo se usa al abrir; despues el lector maneja su propio estado */
    initialProgress?: ReadingProgress;
    onSavePosition: (position: ReadingPosition) => void;
    onBack: () => void;
}

export interface ChapterNavigationBarProps {
    navigation: ChapterNavigation;
    onPrevious: () => void;
    onNext: () => void;
    /* Abre el listado de capitulos (boton "hamburguesa" del medio) */
    onOpenList: () => void;
}

export interface ChapterListModalProps {
    visible: boolean;
    chapters: EpubChapter[];
    /* Capitulo que se esta leyendo: aparece resaltado */
    currentIndex: number;
    onSelect: (chapterIndex: number) => void;
    onClose: () => void;
}

export interface EpubBlockViewProps {
    block: EpubBlock;
}

export interface EpubImageViewProps {
    uri: string;
    /* Medidas en pixeles si el epub las dejo: permiten reservar el lugar antes de que cargue */
    width?: number;
    height?: number;
    alt?: string;
}