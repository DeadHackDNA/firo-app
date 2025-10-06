import { useViewContext } from "../../hooks/use-view-context";
import { MapPin, Flame, Eye } from "lucide-react";

export default function ViewContextSummary() {
    const viewContext = useViewContext();
    const { currentLocation, visibleFires, boundingBox } = viewContext;

    if (!currentLocation && !visibleFires.length && !boundingBox) {
        return null;
    }

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 text-xs">
            <div className="flex items-center gap-2 mb-2">
                <Eye className="w-3 h-3 text-slate-500" />
                <span className="font-semibold text-slate-700">Current View Context</span>
            </div>
            
            {currentLocation && (
                <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-slate-600">
                        <div className="font-medium">{currentLocation.name}</div>
                        <div className="text-slate-500">
                            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                        </div>
                        <div className="text-slate-500">
                            Altitude: {Math.round(currentLocation.zoom / 1000)}km
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-start gap-2">
                <Flame className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-slate-600">
                    {visibleFires.length > 0 ? (
                        <>
                            <div className="font-medium">{visibleFires.length} active fires detected</div>
                            <div className="text-slate-500">
                                High confidence: {visibleFires.filter(f => f.confidence > 80).length} • 
                                Medium: {visibleFires.filter(f => f.confidence >= 50 && f.confidence <= 80).length} • 
                                Low: {visibleFires.filter(f => f.confidence < 50).length}
                            </div>
                        </>
                    ) : (
                        <div className="text-slate-500">No active fires in current view</div>
                    )}
                </div>
            </div>
        </div>
    );
}