import * as Cesium from "cesium";
import {getFireLocations} from "../api/getFireLocations.ts";
import {getPrediction, type RequestBody} from "../api/getPrediction.ts";

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

export const initViewer = async (viewerId: string, dateRange:string): Promise<Cesium.Viewer | undefined> => {
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
        clearTimeout((viewer as any)._fireTimeout);
        (viewer as any)._fireTimeout = setTimeout(() => {
            trackCamera(viewer, dateRange);
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

async function trackCamera(viewer: Cesium.Viewer, dateRange: string) {
    const scene = viewer.scene;
    const camera = viewer.camera;
    const globe = scene.globe;

    // --- Avoid redundant fetches if camera hasn't moved much ---
    const currentPos = Cesium.Cartesian3.clone(camera.positionWC);
    if (
        lastCameraPosition &&
        Cesium.Cartesian3.distance(currentPos, lastCameraPosition) < 500
    ) {
        return; // skip small movements
    }
    lastCameraPosition = currentPos;

    // --- Cancel previous request if it's still running ---
    if (lastFetchAbort) lastFetchAbort.abort();
    lastFetchAbort = new AbortController();

    const topLeft = globe.pick(camera.getPickRay(new Cesium.Cartesian2(0, 0)), scene);
    const bottomRight = globe.pick(
        camera.getPickRay(new Cesium.Cartesian2(scene.canvas.width, scene.canvas.height)),
        scene
    );
    if (!topLeft || !bottomRight) return;

    const topLeftCarton = Cesium.Cartographic.fromCartesian(topLeft);
    const bottomRightCarton = Cesium.Cartographic.fromCartesian(bottomRight);

    const north = Cesium.Math.toDegrees(topLeftCarton.latitude);
    const west = Cesium.Math.toDegrees(topLeftCarton.longitude);
    const south = Cesium.Math.toDegrees(bottomRightCarton.latitude);
    const east = Cesium.Math.toDegrees(bottomRightCarton.longitude);

    const requestBody =
        buildFireLocationsRequestBody(dateRange, south, north, west, east);

    console.log("Requesting fires within:", requestBody);

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
                // Maintain a max of 100 active fires
                if (globalParams.wildFireCollection.length >= 100) {
                    const oldFire = globalParams.wildFireCollection.shift();
                    const oldSmoke = globalParams.smokeCollection.shift();
                    if (oldFire) viewerScene.primitives.remove(oldFire);
                    if (oldSmoke) viewerScene.primitives.remove(oldSmoke);
                }
                particleFire(fire.longitude, fire.latitude, fire.elevation || 0);
                adjustFireVisibility(viewer, Cesium.Color.BLUE);
            }
        }

        for (const fire of predictions.detailed_predictions) {
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
                // Maintain a max of 100 active fires
                if (globalParams.wildFireCollection.length >= 100) {
                    const oldFire = globalParams.wildFireCollection.shift();
                    const oldSmoke = globalParams.smokeCollection.shift();
                    if (oldFire) viewerScene.primitives.remove(oldFire);
                    if (oldSmoke) viewerScene.primitives.remove(oldSmoke);
                }
                particleFire(fire.longitude, fire.latitude, fire.elevation || 0);
                adjustFireVisibility(viewer, Cesium.Color.RED);
            }
        }

        console.log(`🔥 Active fires: ${globalParams.wildFireCollection.length}`);
    } catch (error) {
        if (error.name === "AbortError") {
            // ignored because it means a new request started
            return;
        }
        console.error("Error fetching fire locations:", err);
    }
}


function particleFire(lon: number, lat: number, alt: number) {
    if (!globalParams.viewer) return;
    const r = 0.0;
    const wildFirePosition = Cesium.Cartesian3.fromDegrees(lon, lat, alt + r);
    const eventTime = 300.0;
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
        // Integrate logic wit database here
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

    const maxCameraHeight = 5000; // hide fire if too high
    const maxDistance = 5000;     // hide fire if too far

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
            start = "2023-10-01T00:00:00Z";
            end = "2023-10-31T23:59:59Z";
            break;
        default:
            start = getISODate(1);
            end = getISODate(0);
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