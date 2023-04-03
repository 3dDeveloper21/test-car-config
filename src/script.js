import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { CubeTextureLoader, TextureLoader } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import bumpSource from "/textures/headlamp_bump_map.jpg";
import hdriTexture from "../static/textures/environmentMaps/overpass.hdr?url";
import hdriLake from "../static/textures/environmentMaps/lake.hdr?url";
import hdriBuilding from "../static/textures/environmentMaps/building.hdr?url";

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

THREE.ColorManagement.enabled = true;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 2, 0);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
});

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Texture Loader
 */
// let materialBumpMap = new THREE.MeshPhongMaterial();
const textureLoader = new TextureLoader();
const metalnessMapTexture = textureLoader.load("./textures/metal.png");
const normalMapTexture = textureLoader.load("./textures/normal.png");
const roughnessMap = textureLoader.load("./textures/roughness.png");

normalMapTexture.repeat.set(10, 10);
normalMapTexture.wrapS = normalMapTexture.wrapT = THREE.RepeatWrapping;

// load bump map
// loader.load(
//   "../textures/headlamp_bump_map.jpg",
//   (texture) => {
//     materialBumpMap.bumpMap = texture;
//     // material.bumpScale
//   }
// );

// gui.add(materialBumpMap, "bumpScale", 0, 1, 0.01); // Mesh Phong Material
// console.log(materialBumpMap);

/**
 * Orbit Controls
 */
const controls = new OrbitControls(camera, canvas);

/**
 * Plane
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 6, 4),
  new THREE.MeshBasicMaterial({
    color: 0x808080,
  })
);
floor.rotation.set(-Math.PI * 0.5, 0, 0);
scene.add(floor);

/**
 * Lights - Ambient and Directional
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight
);
directionalLight.position.set(7, 3, -3);
directionalLight.rotateY(Math.PI * 3);
scene.add(directionalLightHelper, directionalLight);

/**
 * Cube Texture Loader
 */
const cubeTextureLoader = new CubeTextureLoader();

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);
// scene.background = environmentMap;
console.log(scene);

/**
 * GLTF Loader
 */
const gltfLoader = new GLTFLoader();
gltfLoader.load("../models/Car/body-test.glb", (gltf) => {
  scene.add(gltf.scene);
  updateAllMaterials();
});

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      console.log(child);
      // hdri loader
      const rgbeLoader = new RGBELoader();
      rgbeLoader.load(hdriBuilding, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        child.material.envMap = texture;
        child.material.metalness = 0;
        child.material.roughness = 0.1;
        child.material.metalnessMap = metalnessMapTexture;
        child.material.normalMap = normalMapTexture;
        child.material.roughnessMap = roughnessMap;
        child.material.color = new THREE.Color("pink");
      });

      if (child.name === "headlight") {
        const headlight = child;
        loader.load("../textures/headlamp_bump_map.jpg", (texture) => {
          headlight.material.bumpMap = texture;
        });
        // new THREE.MeshStandardMaterial({ color: 0xffffff });
        // console.log(headlight.material);
      }
    }
  });
};

/**
 * Resize event handler
 */
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // controls.update();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
