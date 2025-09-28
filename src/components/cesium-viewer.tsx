import { useEffect } from "react";
// @ts-ignore
import * as Cesium from "cesium";

export default function CesiumViewer() {
  useEffect(() => {
    Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

    // Crear viewer
    const viewer = new Cesium.Viewer("cesiumContainer", {
      shouldAnimate: true,
    });

    // Seed fijo para random
    Cesium.Math.setRandomNumberSeed(3);

    // Tiempo de simulación
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const stop = Cesium.JulianDate.addSeconds(start, 120, new Cesium.JulianDate());

    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    viewer.clock.multiplier = 1;
    viewer.clock.shouldAnimate = true;

    viewer.timeline.zoomTo(start, stop);

    // Definir posiciones de un modelo (milk truck)
    const pos1 = Cesium.Cartesian3.fromDegrees(-75.15787310614596, 39.97862668312678);
    const pos2 = Cesium.Cartesian3.fromDegrees(-75.1633691390455, 39.95355089912078);
    const position = new Cesium.SampledPositionProperty();
    position.addSample(start, pos1);
    position.addSample(stop, pos2);

    const entity = viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({ start, stop }),
      ]),
      model: {
        uri: "/fire.blend",
        minimumPixelSize: 64,
      },
      viewFrom: new Cesium.Cartesian3(-100.0, 0.0, 100.0),
      position,
      orientation: new Cesium.VelocityOrientationProperty(position),
    });

    viewer.trackedEntity = entity;

    // Particle system
    const scene = viewer.scene;
    const particleSystem = scene.primitives.add(
      new Cesium.ParticleSystem({
        image: "/smoke.png", // 👈 pon la textura en public/
        startColor: Cesium.Color.LIGHTSEAGREEN.withAlpha(0.7),
        endColor: Cesium.Color.WHITE.withAlpha(0.0),
        startScale: 1.0,
        endScale: 5.0,
        minimumParticleLife: 1.2,
        maximumParticleLife: 1.2,
        minimumSpeed: 1.0,
        maximumSpeed: 4.0,
        imageSize: new Cesium.Cartesian2(25, 25),
        emissionRate: 5.0,
        lifetime: 16.0,
        emitter: new Cesium.CircleEmitter(2.0),
        updateCallback: applyGravity,
      })
    );

    const gravityScratch = new Cesium.Cartesian3();
    function applyGravity(p: any, dt: number) {
      const position = p.position;
      Cesium.Cartesian3.normalize(position, gravityScratch);
      Cesium.Cartesian3.multiplyByScalar(gravityScratch, 0.0 * dt, gravityScratch);
      p.velocity = Cesium.Cartesian3.add(p.velocity, gravityScratch, p.velocity);
    }

    // Actualizar partículas cada frame
    viewer.scene.preUpdate.addEventListener(function (scene, time) {
      if (entity) {
        particleSystem.modelMatrix = entity.computeModelMatrix(time, new Cesium.Matrix4());
      }
    });

    return () => {
      viewer.destroy();
    };
  }, []);

  return <div id="cesiumContainer" style={{ width: "100%", height: "100vh" }} />;
}
