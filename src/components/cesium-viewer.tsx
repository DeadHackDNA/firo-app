import { useEffect } from "react";
import {
  Viewer,
  Ion,
  createWorldTerrainAsync,
  Cartesian3,
  Math as CesiumMath,
  createOsmBuildingsAsync,
  ParticleSystem,
  Color,
  CircleEmitter,
  Matrix4,
  Cartesian2
} from "cesium";

export default function CesiumViewer() {
  useEffect(() => {
    Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

    let viewer: Viewer;

    (async () => {
      viewer = new Viewer("cesiumContainer", {
        terrainProvider: await createWorldTerrainAsync(),
      });

      const scene = viewer.scene;

      // Sistema de partículas (humo)
      scene.primitives.add(
        new ParticleSystem({
          image: "./smoke.png",
          startColor: Color.GRAY.withAlpha(0.6),
          endColor: Color.WHITE.withAlpha(0.0),
          startScale: 5.0,
          endScale: 20.0,
          minimumParticleLife: 1.5,
          maximumParticleLife: 3.0,
          minimumSpeed: 1.0,
          maximumSpeed: 3.0,
          imageSize: new Cartesian2(30, 30),
          emissionRate: 20.0,
          lifetime: 16.0,
          emitter: new CircleEmitter(2.0),
          emitterModelMatrix: Matrix4.fromTranslation(
            Cartesian3.fromDegrees(-122.4175, 37.655, 0)
          ),
        })
      );

      // FlyTo a San Francisco
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
        orientation: {
          heading: CesiumMath.toRadians(0.0),
          pitch: CesiumMath.toRadians(-15.0),
        },
      });

      // Cargar edificios OSM
      const buildingTileset = await createOsmBuildingsAsync();
      if (!viewer.isDestroyed()) {
        scene.primitives.add(buildingTileset);
      }
    })();

    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, []);

  return <div id="cesiumContainer" style={{ width: "100%", height: "100vh" }} />;
}
