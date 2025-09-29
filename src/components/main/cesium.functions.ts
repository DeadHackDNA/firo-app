import { DrawParticles } from "./config/drawParticles";
import {
  type SmokeModel,
  type ParticlePosition,
  type ParticleColors,
} from "./models/smoke.model.ts";
import { Color } from "cesium";

export const DrawDefaultSmoke = (position: ParticlePosition) => {
  const imageUrl = "/smoke.png";
  const smokeModel: SmokeModel = {
    emissionRate: 40.0,
    gravity: 0.0,
    minimumParticleLife: 1.2,
    maximumParticleLife: 1.2,
    minimumSpeed: 1.0,
    maximumSpeed: 4.0,
    startScale: 2.0,
    endScale: 5.0,
    particleSize: 20.0,
    lifeTime: Number.MAX_VALUE,
  };
  const colors: ParticleColors = {
    startColor: Color.BLACK.withAlpha(0.5),
    endColor: Color.WHITE.withAlpha(0.0),
  };
  return DrawParticles(smokeModel, position, imageUrl, colors);
};
