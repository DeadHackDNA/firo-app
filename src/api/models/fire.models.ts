export interface FireLocation {
    id: string;
    latitude: number;
    longitude: number;
    brightness: number;
    scan: number;
    track: number;
    acq_date: string;
    acq_time: string;
    satellite: string;
    instrument: string;
    confidence: number;
    version: number;
    bright_t31: number;
    frp: number;
    daynight: string;
    type: number;
    elevation: number;
    land_cover: number;
    slope: number;
    temperature: number | null;
    wind_speed: number | null;
    precipitation: number | null;
    terrain?: { elevation?: number; land_cover?: string; slope?: number };
    vegetation?: { density?: string };
}

export interface FireResponse {
    count: number;
    requestedLimit: number;
    bboxProvided: boolean;
    data: FireLocation[];
}