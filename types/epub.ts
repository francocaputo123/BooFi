export interface EpubInfo {
    titulo: string;
    autor: string;
    rating: number;
    categorias: string[];
    sinopsis: string;
    portada: string;
}

/* Los capitulos ya no viajan por la URL (pesan demasiado): se busca el libro por id en bookStore */
export interface EpubDetailScreenParams {
    id?: string;
}