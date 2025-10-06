import { useState, useCallback } from 'react';
import { getFireLocations } from '../api/getFireLocations';
import { getPrediction } from '../api/getPrediction';
import type { FireLocation } from '../api/models/fire.models';
import type { PredictionResponse } from '../api/models/prediction.models';

interface FireState {
    locations: FireLocation[];
    predictions: PredictionResponse | null;
    loading: boolean;
    error: string | null;
}

interface UseFireOptimizedReturn {
    fireState: FireState;
    fetchFireLocations: (params: {
        start: string;
        end: string;
        minLat: number;
        maxLat: number;
        minLon: number;
        maxLon: number;
        limit: number;
    }) => Promise<void>;
    fetchPredictions: (params: {
        bbox_corners: {
            top_left: number[];
            bottom_right: number[];
        };
        forecast_date: "2025-10-06";
    }) => Promise<void>;
    clearError: () => void;
}

export function useFireOptimized(): UseFireOptimizedReturn {
    const [fireState, setFireState] = useState<FireState>({
        locations: [],
        predictions: null,
        loading: false,
        error: null,
    });

    const fetchFireLocations = useCallback(async (params: {
        start: string;
        end: string;
        minLat: number;
        maxLat: number;
        minLon: number;
        maxLon: number;
        limit: number;
    }) => {
        setFireState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const locations = await getFireLocations(params);
            setFireState(prev => ({ 
                ...prev, 
                locations, 
                loading: false 
            }));
        } catch (err) {
            console.error('Error fetching fire locations:', err);
            setFireState(prev => ({ 
                ...prev, 
                error: 'Failed to fetch fire locations',
                loading: false 
            }));
        }
    }, []);

    const fetchPredictions = useCallback(async (params: {
        bbox_corners: {
            top_left: number[];
            bottom_right: number[];
        };
        forecast_date: "2025-10-06";
    }) => {
        setFireState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const predictions = await getPrediction(params);
            setFireState(prev => ({ 
                ...prev, 
                predictions, 
                loading: false 
            }));
        } catch (err) {
            console.error('Error fetching fire predictions:', err);
            setFireState(prev => ({ 
                ...prev, 
                error: 'Failed to fetch fire predictions',
                loading: false 
            }));
        }
    }, []);

    const clearError = useCallback(() => {
        setFireState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        fireState,
        fetchFireLocations,
        fetchPredictions,
        clearError,
    };
}