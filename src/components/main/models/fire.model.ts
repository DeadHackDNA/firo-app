import { Cartesian3, Viewer, HeadingPitchRoll, Math as CesiumMath, Transforms } from "cesium";

export const addGlbModel = (viewer: Viewer) => {
  // Coordenadas donde quieres colocar el modelo
  const lon = -71.967;
  const lat = -13.517;
  const height = 0;

  // Posición en el mapa
  const position = Cartesian3.fromDegrees(lon, lat, height);

  // Orientación estable (puedes ajustar los valores si tu modelo aparece girado)
  const hpr = new HeadingPitchRoll(
    CesiumMath.toRadians(0),   // heading (rotación sobre eje Z)
    CesiumMath.toRadians(0),   // pitch (inclinación adelante/atrás)
    CesiumMath.toRadians(0)    // roll (inclinación lateral)
  );

  const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

  viewer.entities.add({
    name: "Mi modelo GLB",
    position,
    orientation, // 👈 fijamos la orientación
    model: {
      uri: "/models/fire.glb", // ponlo en /public/models/fire.glb
      scale: 10.0,
      minimumPixelSize: 64,
      maximumScale: 200.0,
      runAnimations: true,
    },
  });
};
