export type Coords = {
    latitude: number;
    longitude: number;
};

export type LocationStatus = 'loading' | 'granted' | 'denied' | 'error';