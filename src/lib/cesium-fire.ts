import * as Cesium from "cesium";
import { getFireLocations } from "../api/getFireLocations.ts";
import { getPrediction, type RequestBody } from "../api/getPrediction.ts";

export const globalParams: {
    viewer?: Cesium.Viewer;
    fireByDataSourcePromise?: never;
    wildFireCollection: Cesium.ParticleSystem[];
    wildFirePoints: Cesium.Entity[];
    smokeCollection: Cesium.ParticleSystem[];
} = {
    viewer: undefined,
    fireByDataSourcePromise: undefined,
    wildFireCollection: [],
    wildFirePoints: [],
    smokeCollection: [],
};

interface cachedFireLocationsTypes {
    lat: string;
    lon: string;
    terrain?: { elevation?: number; land_cover?: string; slope?: number };
    vegetation?: { density?: string };
}


export const cachedFireLocations: cachedFireLocationsTypes[] = [];
export const cachedFireLocationsPredicted: cachedFireLocationsTypes[] = [];

function clearFirePoints(viewer: Cesium.Viewer) {
    for (const point of globalParams.wildFirePoints) {
        viewer.entities.remove(point);
    }
    globalParams.wildFirePoints = [];
}

function addFirePoint(viewer: Cesium.Viewer, lon: number, lat: number, color: Cesium.Color = Cesium.Color.RED) {
    const pointEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        point: {
            pixelSize: 6,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        },
    });
    globalParams.wildFirePoints.push(pointEntity);
}

export const initViewer = async (viewerId: string): Promise<Cesium.Viewer | undefined> => {
    Cesium.Ion.defaultAccessToken = (import.meta).env?.VITE_CESIUM_TOKEN ?? "";

    const viewer = new Cesium.Viewer(viewerId, {
        baseLayerPicker: false,
        geocoder: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        timeline: false,
        animation: false,
    });

    const imagery = await Cesium.createWorldImageryAsync();
    viewer.imageryLayers.addImageryProvider(imagery);

    viewer.terrainProvider = await Cesium.createWorldTerrainAsync();
    globalParams.viewer = viewer
    globalParams.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-92.34800065326836, 31.03199900619323, 100),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-30),
            roll: 0.0,
        },
    });
    viewer.camera.changed.addEventListener(() => {
        // @ts-ignore
        clearTimeout((viewer)._fireTimeout);
        // @ts-ignore
        (viewer)._fireTimeout = setTimeout(() => {
            trackCamera(viewer);
        }, 2000);
    });
    addParticleFire();
    viewer.camera.changed.addEventListener(() => {
        // @ts-ignore
        if ((viewer)._adjustFireTimeout) {
            // @ts-ignore
            clearTimeout((viewer)._adjustFireTimeout);
        }
        // @ts-ignore
        (viewer)._adjustFireTimeout = setTimeout(() => {
            adjustFireVisibility(viewer);
        }, 1000);
    });
    return viewer;
};

let lastCameraPosition: Cesium.Cartesian3 | null = null;
let lastFetchAbort: AbortController | null = null;

async function trackCamera(viewer: Cesium.Viewer) {
    const scene = viewer.scene;
    const camera = viewer.camera;
    const globe = scene.globe;

    // --- Evitar peticiones redundantes si la cámara no se ha movido mucho ---
    const currentPos = Cesium.Cartesian3.clone(camera.positionWC);
    if (
        lastCameraPosition &&
        Cesium.Cartesian3.distance(currentPos, lastCameraPosition) < 500
    ) {
        return; // omitir movimientos pequeños
    }
    lastCameraPosition = currentPos;

    // --- Cancelar la petición anterior si todavía está en curso ---
    if (lastFetchAbort) lastFetchAbort.abort();
    lastFetchAbort = new AbortController();

    const topLeftRay = camera.getPickRay(new Cesium.Cartesian2(0, 0));
    const bottomRightRay = camera.getPickRay(
        new Cesium.Cartesian2(scene.canvas.width, scene.canvas.height)
    );

    if (!topLeftRay || !bottomRightRay) return;

    const topLeft = globe.pick(topLeftRay, scene);
    const bottomRight = globe.pick(bottomRightRay, scene);
    if (!topLeft || !bottomRight) return;

    const topLeftCarton = Cesium.Cartographic.fromCartesian(topLeft);
    const bottomRightCarton = Cesium.Cartographic.fromCartesian(bottomRight);

    const north = Cesium.Math.toDegrees(topLeftCarton.latitude);
    const west = Cesium.Math.toDegrees(topLeftCarton.longitude);
    const south = Cesium.Math.toDegrees(bottomRightCarton.latitude);
    const east = Cesium.Math.toDegrees(bottomRightCarton.longitude);

    const requestBody =
        buildFireLocationsRequestBody("", south, north, west, east);
    const predictionRequestBody: RequestBody = {
        bbox_corners: {
            top_left: [west, north],
            bottom_right: [east, south],
        },
        forecast_date: "2025-10-06"
    };


    try {
        const [fireLocations, predictions] = await Promise.all([
            getFireLocations(requestBody),
            getPrediction(predictionRequestBody)
        ]);
        if (!fireLocations?.length) return;

        const viewerScene = viewer.scene;

        for (const fire of fireLocations) {
            const exists = globalParams.wildFireCollection.some((pf) => {
                const pos = Cesium.Matrix4.getTranslation(pf.modelMatrix, new Cesium.Cartesian3());
                const carton = Cesium.Cartographic.fromCartesian(pos);
                const lon = Cesium.Math.toDegrees(carton.longitude);
                const lat = Cesium.Math.toDegrees(carton.latitude);
                return (
                    Math.abs(lon - fire.longitude) < 0.0001 &&
                    Math.abs(lat - fire.latitude) < 0.0001
                );
            });

            if (!exists) {
                // Mantener un máximo de 100 incendios activos
                if (globalParams.wildFireCollection.length >= 22) {
                    const oldFire = globalParams.wildFireCollection.shift();
                    const oldSmoke = globalParams.smokeCollection.shift();
                    if (oldFire) viewerScene.primitives.remove(oldFire);
                    if (oldSmoke) viewerScene.primitives.remove(oldSmoke);
                }
                particleFire(fire.longitude, fire.latitude, fire.elevation || 0);
                adjustFireVisibility(viewer, Cesium.Color.BLUE);
                cachedFireLocations.push({
                    lat: fire.latitude.toFixed(4),
                    lon: fire.longitude.toFixed(4),
                    terrain: fire.terrain,
                    vegetation: fire.vegetation
                });
                if (cachedFireLocations.length > 20) {
                    cachedFireLocations.shift(); // mantener solo las últimas 20 ubicaciones
                }
            }
        }

        let count = 0;
        for (const fire of predictions.risk_grid) {
            if (count >= 2) break; // limitar a 2 predicciones por llamada
            count++;
            const exists = globalParams.wildFireCollection.some((pf) => {
                const pos = Cesium.Matrix4.getTranslation(pf.modelMatrix, new Cesium.Cartesian3());
                const carton = Cesium.Cartographic.fromCartesian(pos);
                const lon = Cesium.Math.toDegrees(carton.longitude);
                const lat = Cesium.Math.toDegrees(carton.latitude);
                return (
                    Math.abs(lon - fire.lon) < 0.0001 &&
                    Math.abs(lat - fire.lat) < 0.0001
                );
            });

            if (!exists) {
                // Maintain a max of 22 active fires
                if (globalParams.wildFireCollection.length >= 22) {
                    const oldFire = globalParams.wildFireCollection.shift();
                    const oldSmoke = globalParams.smokeCollection.shift();
                    if (oldFire) viewerScene.primitives.remove(oldFire);
                    if (oldSmoke) viewerScene.primitives.remove(oldSmoke);
                }
                particleFire(fire.lon, fire.lat, fire.elevation || 0);
                adjustFireVisibility(viewer, Cesium.Color.RED);
                cachedFireLocationsPredicted.push({
                    lat: fire.lat.toFixed(4), lon: fire.lon.toFixed(4), terrain: fire.terrain,
                    vegetation: fire.vegetation
                });
                if (cachedFireLocationsPredicted.length > 20) {
                    cachedFireLocationsPredicted.shift(); // mantener solo las últimas 20 ubicaciones
                }
            }
        }
        console.log(`🔥 Active fires: ${globalParams.wildFireCollection.length}`);
    } catch (error) {
        // @ts-ignore
        if (error.name === "AbortError") {
            // ignored because it means a new request started
            return;
        }
        // @ts-ignore
        console.error("Error fetching fire locations:", err);
    }
}


async function particleFire(lon: number, lat: number, alt: number) {
    if (!globalParams.viewer) return;
    const r = 0.0;
    const wildFirePosition = Cesium.Cartesian3.fromDegrees(lon, lat, alt + r);
    const eventTime = 300.0;
    const loopEventTime = true;

    // Utilidad: intentar precargar una imagen (resuelve si se carga)
    const tryLoadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
                img.src = url;
            } catch (e) {
                reject(e);
            }
        });
    };

    // Sistema de partículas de FUEGO (crearlo solo si la imagen se carga)
    try {
        await tryLoadImage("/fire.png");
        const fire = new Cesium.ParticleSystem({
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(wildFirePosition),
            minimumSpeed: 1.0,
            maximumSpeed: 4.0,
            minimumParticleLife: 0.5,
            maximumParticleLife: 2.5,
            lifetime: eventTime,
            loop: loopEventTime,
            emissionRate: 20,
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
    } catch (e) {
        console.warn("fire.png failed to load, skipping fire particle system:", e);
    }

    // Sistema de partículas de HUMO (crearlo solo si la imagen se carga)
    try {
        await tryLoadImage("/smoke.png");
        const smoke = new Cesium.ParticleSystem({
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(wildFirePosition),
            // Hacer que el humo suba más verticalmente y se alargue:
            // - velocidades ascendentes más altas y vida mayor para que las partículas lleguen más alto
            // - ángulo de emisor más estrecho para que suban casi en línea recta
            minimumSpeed: 3.0,
            maximumSpeed: 7.0,
            minimumParticleLife: 4.0,
            maximumParticleLife: 20.0,
            lifetime: eventTime,
            loop: loopEventTime,
            emissionRate: 8,
            image: "/smoke.png",
            // mantener el sprite en un tamaño razonable; el crecimiento viene de start/end scale
            // reducido desde valores muy grandes para evitar una mancha opaca a distancia
            imageSize: new Cesium.Cartesian2(32, 32),
            startScale: 1.6,
            endScale: 16.0,
            // Cono extremadamente estrecho para que las columnas de humo sean altas y delgadas
            // hacer el emisor aún más estrecho para que el humo suba más vertical
            emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(0.2)),
            // reducir la alfa inicial para que el humo sea más translúcido en general
            startColor: Cesium.Color.GRAY.withAlpha(0.45),
            endColor: Cesium.Color.WHITE.withAlpha(0.0),
        });

        // Atenuar la alfa según la distancia a la cámara para que el humo lejano no
        // forme una mancha sólida.
        // Esta función se ejecuta por partícula en cada actualización. Calculamos la
        // distancia entre la cámara y la partícula (en coordenadas del mundo) y atenuamos
        // la alfa de la partícula entre las distancias fadeStart y fadeEnd.
        // Añadir deriva lateral (viento) sin eliminar el comportamiento vertical.
        // Usamos dt para aplicar un pequeño impulso horizontal a la velocidad de la partícula.
        smoke.updateCallback = (particle: any, dt: number) => {
            try {
                if (!globalParams.viewer) return;
                const cameraPos = globalParams.viewer.camera.positionWC;

                // particle.position está en el espacio local del sistema de partículas (modelMatrix).
                // Convertir primero a coordenadas del mundo para el cálculo de distancia/atenuación.
                const worldPos = Cesium.Matrix4.multiplyByPoint(
                    smoke.modelMatrix,
                    particle.position,
                    new Cesium.Cartesian3()
                );

                const distance = Cesium.Cartesian3.distance(cameraPos, worldPos);

                // ajustar estos valores a gusto; a distancias > fadeEnd el humo será mayormente invisible
                const fadeStart = 1800.0; // empezar a atenuar el humo
                const fadeEnd = 4500.0; // totalmente atenuado

                let attenuation = 1.0;
                if (distance > fadeStart) {
                    attenuation = 1.0 - (distance - fadeStart) / (fadeEnd - fadeStart);
                    attenuation = Cesium.Math.clamp(attenuation, 0.0, 1.0);
                }

                // Aplicar la atenuación al alpha del color de la partícula manteniendo su tono actual.
                if (particle.color) {
                    particle.color = particle.color.withAlpha(particle.color.alpha * attenuation);
                }

                // --- DERIVA LATERAL ---
                // Componente horizontal pequeña (en coordenadas locales del sistema):
                // como el sistema usa east-north-up, modificar la componente X mueve el humo hacia el este.
                // Ajusta `windStrength` para controlar qué tanto se desplaza a un lado.
                const windStrength = 7.2; // metros/segundo (valor por defecto, prueba y ajusta)

                // Añadir variación por partícula para que no todas vayan exactamente igual
                const randomFactor = (particle._driftFactor ??= (Math.random() * 0.6 + 0.7));

                // Aumentamos la velocidad horizontal en la componente X del velocity local
                if (!particle.velocity) particle.velocity = new Cesium.Cartesian3();
                // Aplicamos impulso proporcional a dt (velocidad en m/s)
                particle.velocity.x += windStrength * randomFactor * dt;

            } catch (err) {
                // mantener robusto en caso de estado inesperado de la partícula
                // eslint-disable-next-line no-console
                console.warn("smoke updateCallback error", err);
            }
        };

        globalParams.smokeCollection.push(smoke);
        globalParams.viewer.scene.primitives.add(smoke);
    } catch (e) {
        console.warn("smoke.png failed to load, skipping smoke particle system:", e);
    }
}

export const addParticleFire = () => {
    if (!globalParams.viewer) return;

    globalParams.viewer.clock.shouldAnimate = true;
    globalParams.viewer.clock.multiplier = 1;

    const fireData: [number, number, number][] = [
        [-92.34800065326836, 31.03199900619323, 10],
    ];

    for (let i = 0; i < fireData.length; i++) {
        particleFire(fireData[i][0], fireData[i][1], fireData[i][2]);
    }

    cachedFireLocations.push({ lat: fireData[0][1].toFixed(4), lon: fireData[0][0].toFixed(4), terrain: {}, vegetation: {} });
};

export const initFire = () => {
    if (!globalParams.viewer) return;

    globalParams.viewer.clock.currentTime = Cesium.JulianDate.now();

    if (globalParams.fireByDataSourcePromise !== undefined) {
        // Integrar lógica con la base de datos aquí
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

function adjustFireVisibility(viewer: Cesium.Viewer, color: Cesium.Color = Cesium.Color.RED) {
    if (!globalParams.viewer) return;

    const cameraPosition = viewer.camera.positionWC;
    const carton = Cesium.Cartographic.fromCartesian(cameraPosition);
    const terrainHeight = viewer.scene.globe.getHeight(carton);
    const cameraHeightAboveGround = carton.height - (terrainHeight ?? 0);

    const maxCameraHeight = 5000; // ocultar fuego si la cámara está muy alta
    const maxDistance = 5000;     // ocultar fuego si está demasiado lejos

    clearFirePoints(viewer);

    for (const fire of globalParams.wildFireCollection) {
        const firePos = Cesium.Matrix4.getTranslation(fire.modelMatrix, new Cesium.Cartesian3());
        const distance = Cesium.Cartesian3.distance(cameraPosition, firePos);

        const visible = !(distance > maxDistance || cameraHeightAboveGround > maxCameraHeight);
        fire.show = visible;

        const cartonFire = Cesium.Cartographic.fromCartesian(firePos);
        const lon = Cesium.Math.toDegrees(cartonFire.longitude);
        const lat = Cesium.Math.toDegrees(cartonFire.latitude);

        if (!visible) {
            addFirePoint(viewer, lon, lat, color);
        }
    }

    for (const smoke of globalParams.smokeCollection) {
        const smokePos = Cesium.Matrix4.getTranslation(smoke.modelMatrix, new Cesium.Cartesian3());
        const distance = Cesium.Cartesian3.distance(cameraPosition, smokePos);
        smoke.show = !(distance > maxDistance || cameraHeightAboveGround > maxCameraHeight);
    }
}

function buildFireLocationsRequestBody(
    dateRange: string,
    south: number,
    north: number,
    west: number,
    east: number
) {
    const getISODate = (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };

    let start: string;
    let end: string;

    switch (dateRange) {
        case "24h":
            start = getISODate(1);
            end = getISODate(0);
            break;
        case "7d":
            start = getISODate(7);
            end = getISODate(0);
            break;
        case "30d":
            start = getISODate(30);
            end = getISODate(0);
            break;
        case "custom":
            start = "2025-01-01T00:00:00Z";
            end = "2025-10-05T23:59:59Z";
            break;
        default:
            start = "2025-01-01";
            end = "2025-10-05";
    }
    return {
        start,
        end,
        minLat: south,
        maxLat: north,
        minLon: west,
        maxLon: east,
        limit: 100,
    };
}