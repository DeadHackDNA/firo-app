import { useEffect, useRef } from "react";
import { globalParams, initFire, initViewer } from "../lib/cesium-fire";
import { motion } from "framer-motion";

export default function CesiumViewer() {
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initViewer("cesiumContainer");
      } catch (err) {
        console.error("Error inicializando Cesium:", err);
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
      mounted = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="cesiumContainer"
      className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl rounded-xl overflow-hidden border border-gray-700"
    >
      {/* Overlay para branding */}
      <div className="absolute top-4 left-4 bg-black/60 text-white text-sm px-3 py-1 rounded-md backdrop-blur-md shadow-lg">
        🌍 Cesium Viewer
      </div>

      {/* Loader elegante */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
        />
        <span className="ml-3">Cargando mapa...</span>
      </motion.div>
    </div>
  );
}
