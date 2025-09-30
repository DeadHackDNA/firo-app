import * as Cesium from "cesium";

export const globalParams: {
  viewer?: Cesium.Viewer;
  fireByDataSourcePromise?: any;
  wildFireCollection: Cesium.ParticleSystem[];
  smokeCollection: Cesium.ParticleSystem[];
} = {
  viewer: undefined,
  fireByDataSourcePromise: undefined,
  wildFireCollection: [],
  smokeCollection: [],
};

export const initViewer = async (viewerId: string): Promise<Cesium.Viewer | undefined> => {
  // Token desde .env (Vite): VITE_CESIUM_TOKEN
  Cesium.Ion.defaultAccessToken = (import.meta as any).env?.VITE_CESIUM_TOKEN ?? "";

  // Crear viewer con opciones mínimas
  const viewer = new Cesium.Viewer(viewerId, {
    baseLayerPicker: false,
    geocoder: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    timeline: false,
    animation: false,
  });

  // Imagery + terreno
  const imagery = await Cesium.createWorldImageryAsync();
  viewer.imageryLayers.addImageryProvider(imagery);

  viewer.terrainProvider = await Cesium.createWorldTerrainAsync();

  globalParams.viewer = viewer;

  // Inicializar fuego y partículas (usa imágenes en /public)
  initFire();
  addParticleFire();

  return viewer;
};

function particleFire(lon: number, lat: number, alt: number) {
  if (!globalParams.viewer) return;
  const r = 50.0; // altura inicial de las partículas
  const wildFirePosition = Cesium.Cartesian3.fromDegrees(lon, lat, alt + r);
  const eventTime = 300.0; // tiempo de vida total del sistema
  const loopEventTime = true;

  // FIRE particle system
  const fire = new Cesium.ParticleSystem({
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(wildFirePosition),
    minimumSpeed: 1.0,
    maximumSpeed: 4.0,
    minimumParticleLife: 0.5,
    maximumParticleLife: 2.5,
    lifetime: eventTime,
    loop: loopEventTime,
    emissionRate: 20,
    // USAR imágenes en /public: ej. public/fire.png
    image: "/fire.png",
    imageSize: new Cesium.Cartesian2(25, 25),
    startScale: 1.0,
    endScale: 4.0,
    emitter: new Cesium.CircleEmitter(3.0),
    startColor: Cesium.Color.RED.withAlpha(0.9),
    endColor: Cesium.Color.ORANGE.withAlpha(0.3),
  });

  globalParams.wildFireCollection.push(fire);
  globalParams.viewer.scene.primitives.add(fire);

  // SMOKE particle system
  const smoke = new Cesium.ParticleSystem({
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(wildFirePosition),
    minimumSpeed: 0.5,
    maximumSpeed: 2.0,
    minimumParticleLife: 2.0,
    maximumParticleLife: 6.0,
    lifetime: eventTime,
    loop: loopEventTime,
    emissionRate: 10,
    image: "/smoke.png",
    imageSize: new Cesium.Cartesian2(40, 40),
    startScale: 2.0,
    endScale: 8.0,
    emitter: new Cesium.CircleEmitter(5.0),
    startColor: Cesium.Color.GRAY.withAlpha(0.5),
    endColor: Cesium.Color.WHITE.withAlpha(0.0),
  });

  globalParams.smokeCollection.push(smoke);
  globalParams.viewer.scene.primitives.add(smoke);

  console.log("🔥 Fire agregado en:", lon, lat);
  console.log("🔥 primitives count:", globalParams.viewer.scene.primitives.length);
}

export const addParticleFire = () => {
  if (!globalParams.viewer) return;

  globalParams.viewer.clock.shouldAnimate = true;
  globalParams.viewer.clock.multiplier = 1;

  // coordenadas ejemplo en Cusco
  const fireData: [number, number, number][] = [
    [-71.967, -13.517, 3390.0],
    [-71.965, -13.516, 3441.0],
    [-71.969, -13.518, 3389.0],
  ];

  for (let i = 0; i < fireData.length; i++) {
    particleFire(fireData[i][0], fireData[i][1], fireData[i][2]);
  }

  console.log("🔥 Fires agregados:", globalParams.wildFireCollection.length);
  console.log("viewer.scene.primitives.length:", globalParams.viewer.scene.primitives.length);

  globalParams.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-71.967, -13.517, 5000.0),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0.0,
    },
  });
};

export const initFire = () => {
  if (!globalParams.viewer) return;

  const start = Cesium.JulianDate.now();
  globalParams.viewer.clock.currentTime = start;

  if (globalParams.fireByDataSourcePromise !== undefined) {
    // si existiera lógica con data source, podrías llamarla aquí
    // showPromiseData(globalParams.fireByDataSourcePromise, false)
  }

  let wildFireCollen = globalParams.wildFireCollection.length - 1;
  let smokeCollen = globalParams.smokeCollection.length - 1;

  while (wildFireCollen >= 0) {
    globalParams.viewer.scene.primitives.remove(
      globalParams.wildFireCollection[wildFireCollen--]
    );
  }
  globalParams.wildFireCollection = [];

  while (smokeCollen >= 0) {
    globalParams.viewer.scene.primitives.remove(
      globalParams.smokeCollection[smokeCollen--]
    );
  }
  globalParams.smokeCollection = [];
};
