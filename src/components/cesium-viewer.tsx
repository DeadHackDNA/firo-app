import { useEffect, useState } from "react";
import { globalParams, initFire, initViewer, setViewContext } from "../lib/cesium-fire";
import { motion } from "framer-motion";
import LocationSearch from "./ui/LocationSearch.tsx";
import { useViewContext } from "../hooks/use-view-context";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import * as Cesium from "cesium";

export default function CesiumViewer() {
    const [itsMounted, setItsMounted] = useState(false);
    const viewContext = useViewContext();
    const navigate = useNavigate();

    useEffect(() => {
        setItsMounted(true);
    }, []);

    const handleGoHome = () => {
        // CRÍTICO: Limpiar completamente la sesión - no hay cache que limpiar
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("sessionStart");
        navigate("/");
    };

    const handleLocationSelect = (location: { lat: number; lon: number; name: string }) => {
        if (globalParams.viewer && !globalParams.viewer.isDestroyed()) {
            globalParams.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 10000),
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-45),
                    roll: 0.0,
                },
                duration: 2.0
            });
            // El contexto se actualizará automáticamente con el evento camera.changed
        }
    };

    useEffect(() => {
        (async () => {
            try {
                if (!itsMounted) return;
                await initViewer("cesiumContainer");
            } catch (err) {
                console.error("Error initializing Cesium:", err);
            }
        })();

        return () => {
            try {
                initFire();
            } catch (e) {
                console.warn("initFire error:", e);
            }
            if (globalParams.viewer && !globalParams.viewer.isDestroyed()) {
                globalParams.viewer.destroy();
            }
        };
    }, [itsMounted]);

    // Establecer el contexto por separado para evitar reinicios
    useEffect(() => {
        if (itsMounted && globalParams.viewer) {
            setViewContext(viewContext);
        }
    }, [viewContext, itsMounted]);

    return (
        <div
            id="cesiumContainer"
            className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl rounded-xl overflow-hidden border border-slate-600/50">
            
            {/* Top Controls Panel */}
            <div className="absolute top-4 left-4 flex flex-col gap-3 z-50">
                <div className="flex flex-row gap-3 items-start">
                    {/* Home Button */}
                    <button
                        onClick={handleGoHome}
                        className="bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="Volver al inicio"
                    >
                        <Home size={20} />
                    </button>
                    
                    {/* Location Search */}
                    <div className="w-80">
                        <LocationSearch 
                            onLocationSelect={handleLocationSelect}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Info Panel - Positioned to the right of Cesium's home button */}
            <div className="absolute top-2 right-10 flex flex-col gap-3 z-40">
                <div className="bg-gradient-to-r from-blue-600/40 to-purple-600/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-md shadow-sm border border-white/10 pointer-events-none">
                    <p className="text-xs font-medium opacity-90">
                        Click on the map to predict fire risk. Please be patient, the model is working.
                    </p>
                </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-4 left-4 flex gap-3 z-50">
                <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-white/10">
                    <a 
                        href="https://firms.modaps.eosdis.nasa.gov/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-blue-300 transition-colors flex items-center gap-2"
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        Data Source: NASA FIRMS
                    </a>
                </div>
                <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-white/10">
                    <a 
                        href="https://github.com/DeadHackDNA/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-green-300 transition-colors flex items-center gap-2"
                    >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Team Repository
                    </a>
                </div>
                <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-white/10">
                    <a 
                        href="https://landingpage-deadhack.onrender.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-purple-300 transition-colors flex items-center gap-2"
                    >
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Team Website
                    </a>
                </div>
            </div>

            {/* Loading Overlay */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            >
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                        className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                    <div className="text-center">
                        <p className="text-xl font-semibold mb-2">Loading Global Fire Monitor</p>
                        <p className="text-sm text-slate-300">Initializing 3D Earth visualization...</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
