import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import init from './init';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import Stats from 'stats.js';
import * as dat from 'dat.gui'
import './style.css';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { EffectComposer, RenderPass, BloomEffect, GodRaysEffect, EffectPass, FXAAEffect, SMAAEffect } from 'postprocessing';
const GLRFloader = new GLTFLoader();
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';


const { sizes, camera, scene, canvas, controls, renderer } = init();

let crystal = null


const rgbeLoader = new RGBELoader();
rgbeLoader.load('./models/fantasy/Space_21.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});




function addLightToModel(model) {
    // Обходим все меши в модели и заменяем их материал на самосветящийся
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshPhysicalMaterial({
                map: child.material.map,  // сохраняем текстуру, если она есть
                emissive: new THREE.Color(0x33c9ff),
                emissiveIntensity: 3,
                envMap: scene.environment,
                emissiveMap: child.material.map,
                roughness: 0,
            });
        }
    });
}




GLRFloader.load('./models/crystal/scene.gltf', (gltf) => {
    gltf.scene.position.set(0, 5, -40);
    gltf.scene.scale.set(200, 200, 200);
    scene.add(gltf.scene);
    console.log(gltf.scene);
    crystal = gltf.scene

    addLightToModel(gltf.scene);
});








// lightSource.position.set(0, 40, 130); // Позиция источника света
// lightSource.scale.set(10, 10, 10)
// scene.add(lightSource);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));



// const pointLight = new THREE.PointLight(0x33c9ff, 2000, 1000);
// pointLight.position.copy(lightSource.position);
// pointLight.castShadow = true;
// scene.add(pointLight);





const bloomEffect = new BloomEffect({
    intensity: 0.3,
    kernelSize: 2,
    luminanceThreshold: 0,
    luminanceSmoothing: 1,
    // mipmapBlur: true,
});






const fxaaEffect = new SMAAEffect();

// 1. Рендеринг сцены (если не добавлен ранее)
composer.addPass(new RenderPass(scene, camera));

// 2. Эффекты, работающие с исходным изображением
composer.addPass(new EffectPass(camera, bloomEffect));

// 3. Финальная пост-обработка (FXAA)
composer.addPass(new EffectPass(camera, fxaaEffect));


camera.position.set(0, 0, 0);
camera.rotation.set(Math.PI * 2.03, - Math.PI * 2.02, -0.08)
controls.enabled = false;



const directionalLight = new THREE.DirectionalLight(0xffffff, 10); // Направленный свет для создания ярких бликов
directionalLight.position.set(50, 150, 50);
directionalLight.castShadow = true;
scene.add(directionalLight);


const gui = new dat.GUI()
const cameraParams = {
    posX: camera.position.x,
    posY: camera.position.y,
    posZ: camera.position.z,
    fov: camera.fov,
    rotX: camera.rotation.x,
    rotY: camera.rotation.y,
    rotZ: camera.rotation.z
};

// Управление камерой
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(cameraParams, 'posX', -500, 500).onChange(value => camera.position.x = value);
cameraFolder.add(cameraParams, 'posY', -500, 500).onChange(value => camera.position.y = value);
cameraFolder.add(cameraParams, 'posZ', -500, 500).onChange(value => camera.position.z = value);
cameraFolder.add(cameraParams, 'fov', 30, 120).onChange(value => {
    camera.fov = value;
    camera.updateProjectionMatrix();
});
cameraFolder.add(cameraParams, 'rotX', -Math.PI, Math.PI).onChange(value => camera.rotation.x = value);
cameraFolder.add(cameraParams, 'rotY', -Math.PI, Math.PI).onChange(value => camera.rotation.y = value);
cameraFolder.add(cameraParams, 'rotZ', -Math.PI, Math.PI).onChange(value => camera.rotation.z = value);
cameraFolder.open();
const stats = new Stats()
stats.showPanel(0)

document.body.append(stats.dom)

let targetRotationY = 0;
const clock = new THREE.Clock()
const tick = () => {
    const delta = clock.getDelta()
    stats.begin()
    // controls.update();

    window.requestAnimationFrame(tick)


    if (crystal) {
        // Плавная интерполяция: текущее значение приближается к целевому с коэффициентом сглаживания (например, 0.05)
        crystal.rotation.y += (targetRotationY - crystal.rotation.y) * 0.01;
        // crystal.rotation.x += (targetRotationX - crystal.rotation.x) * 0.05;
    }
    composer.render()
    stats.end();
};
tick();


const mouse = { x: 0, y: 0 };

function onMouseMove(event) {
    // Здесь вы можете настроить коэффициенты для достижения нужной чувствительности
    targetRotationY = (event.clientX / window.innerWidth) * 30;
}
window.addEventListener('mousemove', onMouseMove, false);
/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', () => {
    // Обновляем размеры
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Обновляем соотношение сторон камеры
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Обновляем renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    composer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});