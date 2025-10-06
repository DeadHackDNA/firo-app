import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FireLocation } from '../api/models/fire.models';

interface ViewContextType {
    currentLocation: {
        name: string;
        latitude: number;
        longitude: number;
        zoom: number;
    } | null;
    visibleFires: FireLocation[];
    boundingBox: {
        north: number;
        south: number;
        east: number;
        west: number;
    } | null;
    lastPrediction: {
        location: { lat: number; lon: number };
        risk: string;
        timestamp: Date;
    } | null;
    updateCurrentLocation: (location: {
        name: string;
        latitude: number;
        longitude: number;
        zoom: number;
    }) => void;
    updateVisibleFires: (fires: FireLocation[]) => void;
    updateBoundingBox: (box: {
        north: number;
        south: number;
        east: number;
        west: number;
    }) => void;
    updateLastPrediction: (prediction: {
        location: { lat: number; lon: number };
        risk: string;
    }) => void;
    getContextSummary: () => string;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

interface ViewContextProviderProps {
    children: ReactNode;
}

export function ViewContextProvider({ children }: ViewContextProviderProps) {
    const [currentLocation, setCurrentLocation] = useState<ViewContextType['currentLocation']>(null);
    const [visibleFires, setVisibleFires] = useState<FireLocation[]>([]);
    const [boundingBox, setBoundingBox] = useState<ViewContextType['boundingBox']>(null);
    const [lastPrediction, setLastPrediction] = useState<ViewContextType['lastPrediction']>(null);

    const updateCurrentLocation = useCallback((location: {
        name: string;
        latitude: number;
        longitude: number;
        zoom: number;
    }) => {
        setCurrentLocation(location);
    }, []);

    const updateVisibleFires = useCallback((fires: FireLocation[]) => {
        setVisibleFires(fires);
    }, []);

    const updateBoundingBox = useCallback((box: {
        north: number;
        south: number;
        east: number;
        west: number;
    }) => {
        setBoundingBox(box);
    }, []);

    const updateLastPrediction = useCallback((prediction: {
        location: { lat: number; lon: number };
        risk: string;
    }) => {
        setLastPrediction({
            ...prediction,
            timestamp: new Date()
        });
    }, []);

    const getContextSummary = useCallback(() => {
        let summary = "Current view context:\n";
        
        if (currentLocation) {
            summary += `📍 Location: ${currentLocation.name} (${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})\n`;
            summary += `🔍 Zoom level: ${currentLocation.zoom.toFixed(0)}km altitude\n`;
        }

        if (boundingBox) {
            summary += `🗺️ Viewing area: ${boundingBox.north.toFixed(2)}°N to ${boundingBox.south.toFixed(2)}°S, ${boundingBox.west.toFixed(2)}°W to ${boundingBox.east.toFixed(2)}°E\n`;
        }

        if (visibleFires.length > 0) {
            summary += `🔥 Active fires visible: ${visibleFires.length} fire points\n`;
            
            // Agrupar por confianza
            const highConfidence = visibleFires.filter(f => f.confidence > 80).length;
            const medConfidence = visibleFires.filter(f => f.confidence >= 50 && f.confidence <= 80).length;
            const lowConfidence = visibleFires.filter(f => f.confidence < 50).length;
            
            if (highConfidence > 0) summary += `  • High confidence: ${highConfidence} fires\n`;
            if (medConfidence > 0) summary += `  • Medium confidence: ${medConfidence} fires\n`;
            if (lowConfidence > 0) summary += `  • Low confidence: ${lowConfidence} fires\n`;

            // Información de satélites
            const satellites = [...new Set(visibleFires.map(f => f.satellite))];
            summary += `  • Data from satellites: ${satellites.join(', ')}\n`;

            // Fires más recientes
            const recentFires = visibleFires
                .sort((a, b) => new Date(b.acq_date).getTime() - new Date(a.acq_date).getTime())
                .slice(0, 3);
            
            // Información de elevación y terreno si está disponible
            const firesWithElevation = visibleFires.filter(f => f.elevation > 0);
            if (firesWithElevation.length > 0) {
                const avgElevation = firesWithElevation.reduce((sum, f) => sum + f.elevation, 0) / firesWithElevation.length;
                const minElevation = Math.min(...firesWithElevation.map(f => f.elevation));
                const maxElevation = Math.max(...firesWithElevation.map(f => f.elevation));
                summary += `  • Elevation range: ${minElevation.toFixed(0)}m - ${maxElevation.toFixed(0)}m (avg: ${avgElevation.toFixed(0)}m)\n`;
            }

            // Información de cobertura de tierra si está disponible
            const landCoverTypes = visibleFires
                .filter(f => f.terrain?.land_cover)
                .map(f => f.terrain!.land_cover)
                .reduce((acc, type) => {
                    acc[type!] = (acc[type!] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
            
            if (Object.keys(landCoverTypes).length > 0) {
                const landCoverSummary = Object.entries(landCoverTypes)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([type, count]) => `${type} (${count})`)
                    .join(', ');
                summary += `  • Land cover types: ${landCoverSummary}\n`;
            }

            if (recentFires.length > 0) {
                summary += `  • Most recent fires:\n`;
                recentFires.forEach(fire => {
                    const elevationInfo = fire.elevation > 0 ? ` at ${fire.elevation}m elevation` : '';
                    const terrainInfo = fire.terrain?.land_cover ? ` (${fire.terrain.land_cover})` : '';
                    summary += `    - ${fire.acq_date} at ${fire.latitude.toFixed(3)}, ${fire.longitude.toFixed(3)}${elevationInfo}${terrainInfo} (confidence: ${fire.confidence}%)\n`;
                });
            }
        } else {
            summary += `✅ No active fires detected in the current viewing area\n`;
        }

        if (lastPrediction) {
            const timeAgo = Math.floor((Date.now() - lastPrediction.timestamp.getTime()) / 1000);
            summary += `🤖 Last prediction: ${lastPrediction.risk} risk at ${lastPrediction.location.lat.toFixed(4)}, ${lastPrediction.location.lon.toFixed(4)} (${timeAgo}s ago)\n`;
        }

        summary += `\nThis information reflects what the user is currently viewing on the 3D map.`;
        
        return summary;
    }, [currentLocation, visibleFires, boundingBox, lastPrediction]);

    return (
        <ViewContext.Provider value={{
            currentLocation,
            visibleFires,
            boundingBox,
            lastPrediction,
            updateCurrentLocation,
            updateVisibleFires,
            updateBoundingBox,
            updateLastPrediction,
            getContextSummary
        }}>
            {children}
        </ViewContext.Provider>
    );
}

export { ViewContext };