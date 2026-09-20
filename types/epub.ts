export interface EpubInfo {
    titulo: string;
    autor: string;
    rating: number;
    categorias: string[];
    sinopsis: string;
    portada: string;
}

export interface EpubDetailScreenParams {
    title?: string;
    author?: string;
    chapters?: string;
}