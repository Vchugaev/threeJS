import Stats from 'stats.js';
import * as dat from 'dat.gui';

export function initDebugUI(camera, crystal) {
    const gui = new dat.GUI();

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

    // Управление кристаллом
    if (crystal) {
        const crystalFolder = gui.addFolder('Crystal');
        crystalFolder.add(crystal.rotation, 'x', -Math.PI, Math.PI).name('rotX');
        crystalFolder.add(crystal.rotation, 'y', -Math.PI, Math.PI).name('rotY');
        crystalFolder.add(crystal.rotation, 'z', -Math.PI, Math.PI).name('rotZ');
    }

    // Инициализация stats.js
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    return stats;
}