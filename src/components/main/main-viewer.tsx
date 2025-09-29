// import { useEffect } from "react";
// import {
//   Viewer,
//   Ion,
//   createWorldTerrainAsync,
//   Math as CesiumMath,
//   JulianDate,
//   ClockRange,
// } from "cesium";
// import { targetLocation } from "./config/config";
// import { arraySmokePositions } from "./config/firePositions";
// import { DrawDefaultSmoke } from "./cesium.functions";
// import { addGlbModel } from "./models/fire.model";

// export default function MainViewer() {
//   useEffect(() => {
//     Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;
//     let viewer: Viewer;

//     (async () => {
//       viewer = new Viewer("cesiumContainer", {
//         terrainProvider: await createWorldTerrainAsync(),
//       });
//       CesiumMath.setRandomNumberSeed(3);

//       const start = JulianDate.fromDate(new Date(2015, 2, 25, 16));
//       const stop = JulianDate.addSeconds(start, 500, new JulianDate());

//       viewer.clock.startTime = start.clone();
//       viewer.clock.stopTime = stop.clone();
//       viewer.clock.currentTime = start.clone();
//       viewer.clock.clockRange = ClockRange.LOOP_STOP;
//       viewer.clock.multiplier = 1;
//       viewer.clock.shouldAnimate = true;

//       viewer.timeline.zoomTo(start, stop);
//       viewer.camera.flyTo(targetLocation);
//       viewer.zoomTo(viewer.entities);

//       const scene = viewer.scene;

//       const systems: any[] = [];
//       arraySmokePositions.forEach((position) => {
//         const ps = DrawDefaultSmoke(position);
//         scene.primitives.add(ps);
//         systems.push(ps);
//       });

//       // 👉 aquí añades tu modelo .glb
//       addGlbModel(viewer);

//     })();

//     return () => {
//       if (viewer && !viewer.isDestroyed()) {
//         viewer.destroy();
//       }
//     };
//   }, []);

//   return (
//     <div id="cesiumContainer" style={{ width: "100%", height: "100vh" }} />
//   );
// }

import { useEffect, useRef } from "react";
import {
  Viewer,
  Ion,
  createWorldTerrainAsync,
  Cartesian3,
  Color,
  SceneMode,
} from "cesium";

export default function MinimalViewer() {
  const viewerRef = useRef<Viewer | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return; // evita doble init (StrictMode)
    initializedRef.current = true;

    let viewer: Viewer | null = null;

    (async () => {
      Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN ?? "";
      viewer = new Viewer("cesiumContainer", {
        terrainProvider: await createWorldTerrainAsync(),
        sceneMode: SceneMode.SCENE3D,
        geocoder: false,
        homeButton: false,
      });
      viewerRef.current = viewer;
      console.log("Viewer creado:", viewer);

      const lon = -71.967;
      const lat = -13.517;
      const height = 10;

      // Solo el objeto 3D (box de prueba)
      const entity = viewer.entities.add({
        id: "debug-box",
        position: Cartesian3.fromDegrees(lon, lat, height),
        box: {
          dimensions: new Cartesian3(50, 50, 50), // 50m de lado
          material: Color.RED,
        },
      });

      // Mover cámara para verlo
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(lon, lat, 500),
      });

      // Depuración: loguea la posición del box
      const preRenderHandler = () => {
        const t = viewer!.clock.currentTime;
        const p = entity.position && (entity.position as any).getValue
          ? (entity.position as any).getValue(t)
          : undefined;
        console.debug("DEBUG box position:", p);
      };
      viewer.scene.preRender.addEventListener(preRenderHandler);
    })();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return <div id="cesiumContainer" style={{ width: "100%", height: "100vh" }} />;
}

