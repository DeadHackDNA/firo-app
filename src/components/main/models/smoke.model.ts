import { Color } from "cesium";

export type SmokeModel = {
    emissionRate: number,
    gravity: number,
    minimumParticleLife: number,
    maximumParticleLife: number,
    minimumSpeed: number,
    maximumSpeed: number,
    startScale: number,
    endScale: number,
    particleSize: number,
    lifeTime: number
}

export type ParticlePosition = {
  longitude: number;
  latitude: number;
  height: number;
}

export type ParticleColors = {
  startColor: Color;
  endColor: Color;
}