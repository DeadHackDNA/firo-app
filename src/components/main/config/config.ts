import { Cartesian3, Math as CesiumMath } from "cesium";

export const targetLocation = {
  // destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
  destination: Cartesian3.fromDegrees(
    9.041914842288406,
    48.833119059728752,
    20
  ),
  orientation: {
    heading: CesiumMath.toRadians(0.0),
    pitch: CesiumMath.toRadians(-15.0),
  },
};
