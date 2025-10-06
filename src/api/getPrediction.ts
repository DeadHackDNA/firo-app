import type { PredictionResponse } from "./models/prediction.models.ts";
import httpClient from "./http-ia-client.ts";

export interface RequestBody {
    bbox_corners: {
        top_left: number[],
        bottom_right: number[]
    },
    forecast_date: "2025-10-06"
}

// @ts-ignore
export async function getPrediction(requestBody: RequestBody): Promise<PredictionResponse> {
    try {
        const response = await httpClient.post<PredictionResponse>("/predict-fire-risk", requestBody);
        return response.data;
    } catch (error) {
        console.log("Error fetching prediction:", error);
    }
}
