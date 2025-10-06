import * as Cesium from "cesium";
import { getFireLocations } from "../api/getFireLocations.ts";

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

function clearFirePoints(viewer: Cesium.Viewer) {
    for (const point of globalParams.wildFirePoints) {
        viewer.entities.remove(point);
    }
    globalParams.wildFirePoints = [];
}

function addFirePoint(viewer: Cesium.Viewer, lon: number, lat: number) {
    const pointEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        point: {
            pixelSize: 6,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        },
    });
    globalParams.wildFirePoints.push(pointEntity);
}

export const initViewer = async (viewerId: string): Promise<Cesium.Viewer | undefined> => {
    Cesium.Ion.defaultAccessToken = (import.meta as any).env?.VITE_CESIUM_TOKEN ?? "";

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
        clearTimeout((viewer as any)._fireTimeout);
        (viewer as any)._fireTimeout = setTimeout(() => {
            trackCamera(viewer);
        }, 2000);
    });
    addParticleFire();
    viewer.camera.changed.addEventListener(() => {
        if ((viewer as any)._adjustFireTimeout) {
            clearTimeout((viewer as any)._adjustFireTimeout);
        }
        (viewer as any)._adjustFireTimeout = setTimeout(() => {
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

    const topLeftCarto = Cesium.Cartographic.fromCartesian(topLeft);
    const bottomRightCarto = Cesium.Cartographic.fromCartesian(bottomRight);

    const north = Cesium.Math.toDegrees(topLeftCarto.latitude);
    const west = Cesium.Math.toDegrees(topLeftCarto.longitude);
    const south = Cesium.Math.toDegrees(bottomRightCarto.latitude);
    const east = Cesium.Math.toDegrees(bottomRightCarto.longitude);

    const requestBody = {
        start: "2025-01-01",
        end: "2025-02-10",
        minLat: south,
        maxLat: north,
        minLon: west,
        maxLon: east,
        limit: 100, // solicitar como máximo 100
    };

    try {
        const data = await getFireLocations(requestBody);
        if (!data?.length) return;

        const viewerScene = viewer.scene;

        for (const fire of data) {
            const exists = globalParams.wildFireCollection.some((pf) => {
                const pos = Cesium.Matrix4.getTranslation(pf.modelMatrix, new Cesium.Cartesian3());
                const carto = Cesium.Cartographic.fromCartesian(pos);
                const lon = Cesium.Math.toDegrees(carto.longitude);
                const lat = Cesium.Math.toDegrees(carto.latitude);
                return (
                    Math.abs(lon - fire.longitude) < 0.0001 &&
                    Math.abs(lat - fire.latitude) < 0.0001
                );
            });

            if (!exists) {
                // Mantener un máximo de 100 incendios activos
                if (globalParams.wildFireCollection.length >= 100) {
                    const oldFire = globalParams.wildFireCollection.shift();
                    const oldSmoke = globalParams.smokeCollection.shift();
                    if (oldFire) viewerScene.primitives.remove(oldFire);
                    if (oldSmoke) viewerScene.primitives.remove(oldSmoke);
                }
                particleFire(fire.longitude, fire.latitude, fire.elevation || 0);
                adjustFireVisibility(viewer);
            }
        }

        console.log(`🔥 Active fires: ${globalParams.wildFireCollection.length}`);
    } catch (err: any) {
        if (err.name === "AbortError") {
            // ignorado porque significa que se inició una nueva petición
            return;
        }
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

function adjustFireVisibility(viewer: Cesium.Viewer) {
    if (!globalParams.viewer) return;

    const cameraPosition = viewer.camera.positionWC;
    const carto = Cesium.Cartographic.fromCartesian(cameraPosition);
    const terrainHeight = viewer.scene.globe.getHeight(carto);
    const cameraHeightAboveGround = carto.height - (terrainHeight ?? 0);

    const maxCameraHeight = 5000; // ocultar fuego si la cámara está muy alta
    const maxDistance = 5000;     // ocultar fuego si está demasiado lejos

    clearFirePoints(viewer); // limpia puntos previos

    for (const fire of globalParams.wildFireCollection) {
        const firePos = Cesium.Matrix4.getTranslation(fire.modelMatrix, new Cesium.Cartesian3());
        const distance = Cesium.Cartesian3.distance(cameraPosition, firePos);

        const visible = !(distance > maxDistance || cameraHeightAboveGround > maxCameraHeight);
        fire.show = visible;

        // convertir posición a coordenadas geográficas
        const cartoFire = Cesium.Cartographic.fromCartesian(firePos);
        const lon = Cesium.Math.toDegrees(cartoFire.longitude);
        const lat = Cesium.Math.toDegrees(cartoFire.latitude);

        if (!visible) {
            addFirePoint(viewer, lon, lat);
        }
    }

    for (const smoke of globalParams.smokeCollection) {
        const smokePos = Cesium.Matrix4.getTranslation(smoke.modelMatrix, new Cesium.Cartesian3());
        const distance = Cesium.Cartesian3.distance(cameraPosition, smokePos);
        const visible = !(distance > maxDistance || cameraHeightAboveGround > maxCameraHeight);
        smoke.show = visible;
    }
}