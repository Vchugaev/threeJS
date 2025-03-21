import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
const GLRFloader = new GLTFLoader();
const rgbeLoader = new RGBELoader();
const fbxLoader = new FBXLoader();

export function loadHDRI(path, scene, onLoad, onError) {

    rgbeLoader.load(path, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        if (onLoad) onLoad(texture);
    }, undefined, onError);
}

function addLightToModel(model, scene) {
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

export function loadGLRF(path, scene) {
    return new Promise((resolve, reject) => {
        GLRFloader.load(
            path,
            (gltf) => {
                gltf.scene.position.set(2, 5, -40);
                gltf.scene.scale.set(200, 200, 200);
                scene.add(gltf.scene);
                console.log('Model Loaded:', gltf.scene);

                gltf.scene.rotation.z = Math.PI / 32;
                addLightToModel(gltf.scene, scene);

                resolve(gltf.scene); // Возвращаем загруженную модель
            },
            undefined,
            (error) => reject(error) // Обрабатываем ошибку
        );
    });
}


export function loadFBX(modelPath, texturePath, scene) {
    return new Promise((resolve, reject) => {

        // Загрузка текстуры (если указана)
        let texture = null;
        if (texturePath) {
            const textureLoader = new THREE.TextureLoader();
            texture = textureLoader.load(texturePath, undefined, undefined, (error) => {
                console.error('Ошибка загрузки текстуры:', error);
            });
        }

        // Загрузка FBX модели
        fbxLoader.load(modelPath, (object) => {
            // Применяем текстуру к материалам модели (если текстура загружена)
            if (texture) {
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material.map = texture;
                        child.material.needsUpdate = true; // Обновляем материал
                    }
                });
            }

            // Добавляем модель на сцену
            scene.add(object);
            console.log('FBX модель загружена:', object);

            resolve(object); // Возвращаем загруженную модель
        }, undefined, (error) => {
            console.error('Ошибка загрузки FBX модели:', error);
            reject(error);
        });
    });
}
