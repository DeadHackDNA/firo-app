import { useEffect, useState } from "react";
import { globalParams, initFire, initViewer } from "../lib/cesium-fire";
import { motion } from "framer-motion";

export default function CesiumViewer() {
    const [itsMounted, setItsMounted] = useState(false);

    useEffect(() => {
        setItsMounted(true);
    }, []);

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

    return (
        <div
            id="cesiumContainer"
            className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl rounded-xl overflow-hidden border border-gray-700">
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-50">
<<<<<<< HEAD
                <div className="d-flex">
                    <div className="flex flex-col gap-2">
                        <div>
                            <DateRangeSelect onRangeChange={() => { console.log("sadjads") }} />
                        </div>
                        <div className="bg-black/60 text-white text-sm px-3 py-1 rounded-md backdrop-blur-md shadow-lg">
                            <a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                🚀 Data Source: NASA FIRo
                            </a>
                        </div>
                        <div className="bg-black/60 text-white text-sm px-3 py-1 rounded-md backdrop-blur-md shadow-lg">
                            <a href="https://github.com/DeadHackDNA/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                🚀 Team
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
                <div className="">
                    <div className="flex items-center justify-center text-white">
                        {/* <div className="w-5 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin px-2"></div> */}
                        <p className="px-2 text-lg font-semibold text-blue-200 animate-pulse">
                            Interact with the map to predict fire
                        </p>
                    </div>
=======
                <div className="bg-black/60 text-white text-sm px-3 py-1 rounded-md backdrop-blur-md shadow-lg">
                    🌍 Cesium Viewer
>>>>>>> 1acf2b5cb453be75353b06a17576a96f01623e68
                </div>
            </div>
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                />
                <span className="ml-3">Loading map...</span>
            </motion.div>
        </div>
    );
}
