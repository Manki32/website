import './style.css';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import countries from "./files/custom.geo.json";
import lines from "./files/lines.json";
import map from "./files/map.json";

const markerSvg = `<svg width="10" height="10">
<circle cx="5" cy="5" r="4" fill="#ffffff" />
</svg>`;


const Globe = new ThreeGlobe({
  animateIn: true,
  waitForGlobeReady: true,
})
  .hexPolygonsData(countries.features)
  .hexPolygonResolution(3)
  .hexPolygonMargin(0.6)
  .hexPolygonColor(() => '#ffffff')
  .showAtmosphere(true)
  .atmosphereColor('#F9FAFE')
  .atmosphereAltitude(0.1)
  .htmlElementsData(map.maps)
  .htmlElement((d) => {
    const el = document.createElement('div');
    el.innerHTML = markerSvg;
    el.style.color = 'white';
    el.style.width = `10px`;
    return el;
  })

  Globe.arcsData(lines.pulls)
  .arcColor((e) => {
    return e.status ? "#ffffff" : "#ffffff";
  })
  .arcAltitude((e) =>{
    return e.arcAlt;
  })
  .arcStroke((e) => {
    return e.status ? 0.5 : 0.3
  })
  .arcDashLength(0.9)
  .arcDashGap(4)
  .arcDashAnimateTime(1500)
  .arcsTransitionDuration(1200)
  .arcDashInitialGap((e) => e.order * 1)
  .pointsData(map.maps)
  .pointColor(() => "#ffffff")
  .pointsMerge(true)
  .pointAltitude(0.07)
  .pointRadius(0.05);

const globeMaterial = Globe.globeMaterial();
globeMaterial.color = new THREE.Color('#4A71FA');
globeMaterial.emissive = new THREE.Color('#84C8FF');
globeMaterial.emissiveIntensity = 0.18;

// Setup renderers
const renderer = new THREE.WebGLRenderer();
const wrapper = document.querySelector('[three-js="globe_wrapper"]')
renderer.setSize(window.innerWidth, window.innerHeight);
wrapper.appendChild(renderer.domElement);

const cssRenderer = new CSS2DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0px';
wrapper.appendChild(cssRenderer.domElement);

// Setup scene
const scene = new THREE.Scene();
scene.add(Globe);
scene.add(new THREE.AmbientLight(0xffffff, 0.33));
scene.add(new THREE.DirectionalLight(0xffffff, 0.1));
scene.background = new THREE.Color('#dddddd');
scene.backgroundIntensity = 20;

// Setup camera
const camera = new THREE.PerspectiveCamera();
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.position.z = 200;
camera.position.x = 200;
camera.position.y = 200;

// Add camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dynamicDampingFactor = 0.2;
controls.enablePan = false;
controls.minDistance = 200;
controls.maxDistance = 500;
controls.rotateSpeed = 0.8;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;


// Update pov when camera moves
Globe.setPointOfView(camera.position, Globe.position);
controls.addEventListener('change', () => Globe.setPointOfView(camera.position, Globe.position));

// Bloom effect
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.2;
bloomPass.strength = 0.45;
bloomPass.radius = 0.1;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Kick-off renderers
(function animate() {
  // Frame cycle
  controls.update();
  composer.render();
  cssRenderer.render(scene, camera);
  requestAnimationFrame(animate);
  
})();


