export interface CreatePreferenceParams {
    bookId: string;
    title: string;
    price: number;
}

export interface PreferenceApiResponse {
    id: string;
    init_point: string;
    sandbox_init_point: string;
}
