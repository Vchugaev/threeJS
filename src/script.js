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
import gsap from 'gsap';
import SplitType from 'split-type';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

const myText = new SplitType('.chugaev');
const aboutSection = document.querySelector('.about')
const aboutTextBox = document.querySelector('.about__text__box')


const { sizes, camera, scene, canvas, controls, renderer } = init();

let crystal = null
let isScroll = false


const rgbeLoader = new RGBELoader();
rgbeLoader.load('./models/fantasy/Space_21.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

const planeBG = document.querySelector('.change__bg__color--plane')
document.documentElement.scrollTop

function addLightToModel(model) {
    // Обходим все меши в модели и заменяем их материал на самосветящийся
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshPhysicalMaterial({
                map: child.material.map,  // сохраняем текстуру, если она есть
                emissive: new THREE.Color(0x33c9ff),
                emissiveIntensity: 0,
                envMap: scene.environment,
                emissiveMap: child.material.map,
                roughness: 0,
            });
        }
    });
}




GLRFloader.load('./models/crystal/scene.gltf', (gltf) => {
    gltf.scene.position.set(2, 5, -40);
    gltf.scene.scale.set(200, 200, 200);
    scene.add(gltf.scene);
    console.log(gltf.scene);
    crystal = gltf.scene
    crystal.rotation.z = Math.PI / 32
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
    mipmapBlur: true,
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



// const directionalLight = new THREE.DirectionalLight(0xffffff, 10); // Направленный свет для создания ярких бликов
// directionalLight.position.set(50, 150, 50);
// directionalLight.castShadow = true;
// scene.add(directionalLight);


// const gui = new dat.GUI()
// const cameraParams = {
//     posX: camera.position.x,
//     posY: camera.position.y,
//     posZ: camera.position.z,
//     fov: camera.fov,
//     rotX: camera.rotation.x,
//     rotY: camera.rotation.y,
//     rotZ: camera.rotation.z
// };

// // Управление камерой
// const cameraFolder = gui.addFolder('Camera');
// const crystalFolder = gui.addFolder('Crystal');
// cameraFolder.add(cameraParams, 'posX', -500, 500).onChange(value => camera.position.x = value);
// cameraFolder.add(cameraParams, 'posY', -500, 500).onChange(value => camera.position.y = value);
// cameraFolder.add(cameraParams, 'posZ', -500, 500).onChange(value => camera.position.z = value);
// cameraFolder.add(cameraParams, 'fov', 30, 120).onChange(value => {
//     camera.fov = value;
//     camera.updateProjectionMatrix();
// });
// cameraFolder.add(cameraParams, 'rotX', -Math.PI, Math.PI).onChange(value => camera.rotation.x = value);
// cameraFolder.add(cameraParams, 'rotY', -Math.PI, Math.PI).onChange(value => camera.rotation.y = value);
// cameraFolder.add(cameraParams, 'rotZ', -Math.PI, Math.PI).onChange(value => camera.rotation.z = value);

// crystalFolder.add(cameraParams, 'rotY', -Math.PI, Math.PI).onChange(value => crystal.rotation.y = value);
// crystalFolder.add(cameraParams, 'rotZ', -Math.PI, Math.PI).onChange(value => crystal.rotation.z = value);
// crystalFolder.add(cameraParams, 'rotX', -Math.PI, Math.PI).onChange(value => crystal.rotation.x = value);

const stats = new Stats()
// stats.showPanel(0)

// document.body.append(stats.dom)

let rotationSpeed = 0; // текущая скорость вращения (в «радианах в секунду»)
let lastMouseX = null; // последнее значение координаты X курсора
let lastTime = null;   // последнее время (в мс)
const clock = new THREE.Clock()
const tick = () => {
    const delta = clock.getDelta()
    stats.begin()
    // controls.update();

    window.requestAnimationFrame(tick)


    if (crystal) {
        // Обновляем вращение модели с учётом накопленной скорости
        crystal.rotation.y += rotationSpeed * delta;
        if (rotationSpeed < 1) {
            crystal.rotation.y += 0.001
        }

        // Применяем плавное затухание (используем слабее затухание, чтобы энергия decay была мягче)
        rotationSpeed *= 0.99;
        // crystal.rotation.z = Math.PI / 32
        crystal.rotation.x = Math.PI / 32
        // Обновляем интенсивность свечения (энергия) пропорционально скорости,
        // но задаём минимальное значение, чтобы свет всегда был.
        crystal.traverse((child) => {
            if (child.isMesh && child.material && !isScroll) {
                // Вычисляем интенсивность на основе абсолютной скорости
                let intensity = Math.abs(rotationSpeed) / 2;
                // Задаём минимум (например, 0.5) и максимум (например, 3)
                intensity = Math.max(intensity, 0.5);
                intensity = Math.min(intensity, 30);
                child.material.emissiveIntensity = intensity;
                // child.material.roughness = -intensity;
            }
        });
    }
    composer.render()
    stats.end();
};
tick();
function onMouseMove(event) {
    const currentTime = performance.now();
    if (lastMouseX !== null && lastTime !== null && !isScroll) {
        const deltaTime = (currentTime - lastTime) / 1000; // в секундах
        const deltaX = event.clientX - lastMouseX;          // изменение позиции
        const speed = deltaX / deltaTime;                   // пиксели в секунду

        // Добавляем энергию: не перезаписываем, а суммируем с текущей скоростью.
        // Коэффициент масштабирования подбирается экспериментально.
        rotationSpeed += speed * 0.0003;

        // Ограничиваем максимальную скорость вращения, если нужно
        const maxRotationSpeed = 10;
        if (rotationSpeed > maxRotationSpeed) rotationSpeed = maxRotationSpeed;
        if (rotationSpeed < -maxRotationSpeed) rotationSpeed = -maxRotationSpeed;
    }
    lastMouseX = event.clientX;
    lastTime = currentTime;
}


// Предположим, что объект crystal, камера и GSAP уже инициализированы
const state = { value: 0 };
let tween; // для хранения текущего tween’а
let tl = gsap.timeline()
window.addEventListener('scroll', () => {
    // Получаем текущее значение прокрутки
    const currentScroll = window.scrollY;

    // GSAP-анимация: анимируем state.value к currentScroll
    if (tween) tween.kill();
    tween = gsap.to(state, {
        value: currentScroll,
        duration: 0.5,         // длительность анимации (сек)
        ease: "power2.out",    // выбранный easing
        onUpdate: () => {
            console.log('GSAP state.value:', state.value);


            crystal.position.z = (state.value / 50) - 40
            camera.fov = 50 - state.value / 20;
            camera.updateProjectionMatrix();

            crystal.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Вычисляем интенсивность на основе rotationSpeed
                    let intensity = Math.abs(rotationSpeed) / 2;
                    // Ограничиваем диапазон значения интенсивности
                    intensity = Math.max(intensity, 0.5);
                    intensity = Math.min(intensity, 30);

                    // Если формула должна зависеть от scroll, можно задать свою логику,
                    // но в данном случае делаем просто intensity * 2
                    child.material.emissiveIntensity = intensity * Math.pow(state.value / 300, 3);  // Exponential increase
                    child.material.roughness = intensity * state.value / 800;
                    // child.material.roughness = -intensity;
                }
            });


            planeBG.style.backgroundColor = '#fff'
            if (state.value > 650) {
                planeBG.style.opacity = Math.pow((state.value - 650) / 600, 3)
            } else {
                planeBG.style.opacity = 0
            }
            if (state.value > 1350) {
                planeBG.style.opacity = 0
                canvas.style.display = 'none'
                aboutSection.style.opacity = 1

                if (!tl.isActive()) {
                    tl.to('.char', {
                        y: 0,
                        stagger: 0.05,
                        duration: 0.1,
                    })

                    aboutTextBox.classList.add('animate__width')
                } else {
                    tl.play()
                }

            } else {
                canvas.style.display = 'block'
                aboutSection.style.opacity = 0
            }
        }
    });


    // Обновляем флаг isScroll
    if (currentScroll > 300) {
        isScroll = true;
    } else {
        isScroll = false;
    }

    // Обновляем позицию и вращение объекта crystal


    const crystalRotation = Math.PI / 32;
    const crystalY = 5;
    crystal.position.y = crystalY - (currentScroll / 250);
    crystal.rotation.z = crystalRotation + (currentScroll / 500);

    // Обновляем настройки камеры
    // camera.fov = 50 - currentScroll / 20;

    // Обходим дочерние элементы crystal и обновляем материал


    console.log('window.scrollY / 100:', currentScroll / 100);
});



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