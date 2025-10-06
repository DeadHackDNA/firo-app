import httpClient from "./http-client.ts";
import type { FireLocation, FireResponse } from "./models/fire.models.ts";

interface RequestBody {
    start: string;
    end: string;
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
    limit: number;
}

export async function getFireLocations(requestBody: RequestBody): Promise<FireLocation[]> {
    try {
        const response = await httpClient.get<FireResponse>("/fires", {
            params: requestBody,});
        return response.data.data;
    } catch (error) {
        console.error("Error fetching fire locations:", error);
        return [];
    }
}