import * as Cesium from "cesium";
import {getFireLocations} from "../api/getFireLocations.ts";

export const globalParams: {
    viewer?: Cesium.Viewer;
    fireByDataSourcePromise?: never;
    wildFireCollection: Cesium.ParticleSystem[];
    smokeCollection: Cesium.ParticleSystem[];
} = {
    viewer: undefined,
    fireByDataSourcePromise: undefined,
    wildFireCollection: [],
    smokeCollection: [],
};

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
        destination: Cesium.Cartesian3.fromDegrees(22.25880240645848, 2.66370198258959, 500.0),
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
    })
    viewer.scene.postRender.addEventListener(() => {
        adjustFireVisibility(viewer);
    });
    return viewer;
};

async function trackCamera(viewer: Cesium.Viewer) {
    const scene = viewer.scene;
    const camera = viewer.camera;
    const globe = scene.globe;

    const topLeft = globe.pick(
        camera.getPickRay(new Cesium.Cartesian2(0, 0)),
        scene
    );
    const bottomRight = globe.pick(
        camera.getPickRay(new Cesium.Cartesian2(scene.canvas.width, scene.canvas.height)),
        scene
    );

    if (!topLeft || !bottomRight) return null;

    const topLeftCarton = Cesium.Cartographic.fromCartesian(topLeft);
    const bottomRightCarton = Cesium.Cartographic.fromCartesian(bottomRight);

    const north = Cesium.Math.toDegrees(topLeftCarton.latitude);
    const west = Cesium.Math.toDegrees(topLeftCarton.longitude);
    const south = Cesium.Math.toDegrees(bottomRightCarton.latitude);
    const east = Cesium.Math.toDegrees(bottomRightCarton.longitude);

    const requestBody = {
        start: "2025-01-01",
        end: "2025-10-10",
        minLat: south,
        maxLat: north,
        minLon: west,
        maxLon: east,
        limit: 500,
    };

    try {
        const data = await getFireLocations(requestBody);
        if (data && data.length > 0) {
            console.log("Data: ", data);
            globalParams.wildFireCollection = []
            for (const fire of data) {
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
                    particleFire(fire.longitude, fire.latitude, 3500);
                }
            }
            console.log("Fires added:", globalParams.wildFireCollection.length);
        }
    } catch (err) {
        console.error("Error fetching fire locations:", err);
    }
}

function particleFire(lon: number, lat: number, alt: number) {
    if (!globalParams.viewer) return;
    const r = 50.0;
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
        [-71.967, -13.517, 3390.0],
        [-71.965, -13.516, 3441.0],
        [-71.969, -13.518, 3389.0],
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

function adjustFireVisibility(viewer: Cesium.Viewer) {
    if (!globalParams.viewer) return;

    const cameraPosition = viewer.camera.positionWC;
    const cameraHeight = viewer.scene.globe.ellipsoid.cartesianToCartographic(cameraPosition).height;

    const carton = Cesium.Cartographic.fromCartesian(viewer.camera.positionWC);
    const terrainHeight = viewer.scene.globe.getHeight(carton);
    const cameraHeightAboveGround = carton.height - (terrainHeight ?? 0);

    //const maxCameraHeight = 5000; // hide if too high
    //const maxDistance = 5000; // hide if too far

    for (const fire of globalParams.wildFireCollection) {
        const firePos = Cesium.Matrix4.getTranslation(fire.modelMatrix, new Cesium.Cartesian3());
        const distance = Cesium.Cartesian3.distance(cameraPosition, firePos);
        // fire.show = !(distance > maxDistance || cameraHeightAboveGround > maxCameraHeight);
    }

    for (const smoke of globalParams.smokeCollection) {
        const smokePos = Cesium.Matrix4.getTranslation(smoke.modelMatrix, new Cesium.Cartesian3());
        const distance = Cesium.Cartesian3.distance(cameraPosition, smokePos);

        // smoke.show = !(distance > maxDistance || cameraHeight > maxCameraHeight);
    }
}
