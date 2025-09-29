import {
  type SmokeModel,
  type ParticlePosition,
  type ParticleColors,
} from "../models/smoke.model.ts";

import {
  ParticleSystem,
  Cartesian2,
  Cartesian3,
  Matrix4,
  CircleEmitter,
  Transforms,
} from "cesium";

export const DrawParticles = (
  smokeModel: SmokeModel,
  position: ParticlePosition,
  imageUrl: string,
  colors: ParticleColors
) => {
  const modelMatrix = Transforms.eastNorthUpToFixedFrame(
    Cartesian3.fromDegrees(
      position.longitude,
      position.latitude,
      position.height ?? 0
    )
  );

  return new ParticleSystem({
    image: imageUrl,
    startColor: colors.startColor,
    endColor: colors.endColor,
    startScale: smokeModel.startScale,
    endScale: smokeModel.endScale,
    minimumParticleLife: smokeModel.minimumParticleLife,
    maximumParticleLife: smokeModel.maximumParticleLife,
    minimumSpeed: smokeModel.minimumSpeed,
    maximumSpeed: smokeModel.maximumSpeed,
    imageSize: new Cartesian2(smokeModel.particleSize, smokeModel.particleSize),
    emissionRate: smokeModel.emissionRate,
    lifetime: smokeModel.lifeTime,
    emitter: new CircleEmitter(2.0),
    modelMatrix: modelMatrix,
    emitterModelMatrix: Matrix4.fromTranslation(
        new Cartesian3(0.0, 0.0, 0.0)
    ),
  });
};
