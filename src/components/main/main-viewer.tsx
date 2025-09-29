import { useEffect } from "react";
import {
  Viewer,
  Ion,
  createWorldTerrainAsync,
  Math as CesiumMath,
  JulianDate,
  ClockRange,
} from "cesium";
import { targetLocation } from "./config/config";
import { arraySmokePositions } from "./config/firePositions";
import { DrawDefaultSmoke } from "./cesium.functions";

export default function MainViewer() {
  useEffect(() => {
    Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;
    let viewer: Viewer;

    (async () => {
      viewer = new Viewer("cesiumContainer", {
        terrainProvider: await createWorldTerrainAsync(),
      });
      CesiumMath.setRandomNumberSeed(3);

      //Set bounds of our simulation time
      const start = JulianDate.fromDate(new Date(2015, 2, 25, 16));
      const stop = JulianDate.addSeconds(start, 500, new JulianDate());

      //Make sure viewer is at the desired time.
      viewer.clock.startTime = start.clone();
      viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.clock.clockRange = ClockRange.LOOP_STOP;
      viewer.clock.multiplier = 1;
      viewer.clock.shouldAnimate = true;

      //Set timeline to simulation bounds
      viewer.timeline.zoomTo(start, stop);
      viewer.camera.flyTo(targetLocation);

      const scene = viewer.scene;
      arraySmokePositions.forEach((position) => {
        scene.primitives.add(DrawDefaultSmoke(position));
      });
    })();

    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, []);

  return (
    <div id="cesiumContainer" style={{ width: "100%", height: "100vh" }} />
  );
}
