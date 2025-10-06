export interface PredictionAnalysis {
    analysis_timestamp: string,
    analysis_type: string,
    area_name: string,
    coordinate_system: string,
    csv_file_generated: string,
    model_version: string,
    region_detected: string,
    specialized_model_used: string,
    total_points_analyzed: number
}
export interface PredictionDetail {
    elevation: number,
    fire_probability: number,
    humidity: number,
    latitude: number,
    longitude: number,
    model_used: string,
    precipitation: number,
    risk_level: string,
    temperature: number,
    wind_speed: number
}

export interface PredictionResponse {
    risk_grid: any[]
    recommendations: any[]
    fire_risk_assessment: any[]
}