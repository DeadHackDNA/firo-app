import { useEffect } from "react";
import {
  Viewer,
  Cartesian3,
  Math as CesiumMath,
  ParticleSystem,
  Color,
  CircleEmitter,
  Matrix4,
  Cartesian2,
  EllipsoidTerrainProvider,
} from "cesium";

export default function CesiumViewer2() {
  useEffect(() => {
    const viewer = new Viewer("cesiumContainer", {
      terrainProvider: new EllipsoidTerrainProvider(),
      timeline: false,
      animation: false,
    });

    const scene = viewer.scene;

    // Partículas visibles
    scene.primitives.add(
      new ParticleSystem({
        image: "/smoke.png",
        startColor: Color.DARKGRAY.withAlpha(0.7),
        endColor: Color.WHITE.withAlpha(0.0),
        startScale: 10.0,
        endScale: 50.0,
        minimumParticleLife: 2.0,
        maximumParticleLife: 4.0,
        minimumSpeed: 2.0,
        maximumSpeed: 5.0,
        imageSize: new Cartesian2(60, 60),
        emissionRate: 50.0,
        lifetime: Number.POSITIVE_INFINITY,
        emitter: new CircleEmitter(5.0),
        emitterModelMatrix: Matrix4.fromTranslation(
          Cartesian3.fromDegrees(-122.4175, 37.655, 0)
        ),
      })
    );

    // Cámara bien enfocada
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(-122.4175, 37.655, 500),
      orientation: {
        heading: CesiumMath.toRadians(0.0),
        pitch: CesiumMath.toRadians(-20.0),
      },
    });

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, []);

  return <div id="cesiumContainer" style={{ width: "100%", height: "100vh" }} />;
}
