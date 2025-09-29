import { Cartesian3, Math as CesiumMath } from "cesium";

export const targetLocation = {
  destination: Cartesian3.fromDegrees(
    -71.967,   // longitud
    -13.517,   // latitud
    200        // altura de la cámara en metros
  ),
  orientation: {
    heading: CesiumMath.toRadians(0.0),   // 0 = norte, puedes girar (90 = este, 180 = sur)
    pitch: CesiumMath.toRadians(-30.0),   // -30° inclina la cámara hacia abajo
    roll: 0.0,
  },
};
