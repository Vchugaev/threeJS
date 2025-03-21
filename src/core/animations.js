import gsap from "gsap";
import applyShake from "./shake";

export const CrystalRotate = (crystal, rotationState, delta, isScroll, currentScroll) => {
  if (crystal) {
    // Обновляем вращение модели с учётом накопленной скорости
    crystal.rotation.y += rotationState.rotationSpeed * delta;
    
    if (rotationState.rotationSpeed < 1) {
      crystal.rotation.y += 0.001 * Math.max(1, currentScroll / 3);
    }

    // Применяем плавное затухание (используем слабее затухание, чтобы энергия decay была мягче)
    rotationState.rotationSpeed *= 0.99;
    // crystal.rotation.z = Math.PI / 32
    crystal.rotation.x = Math.PI / 32;
    // Обновляем интенсивность свечения (энергия) пропорционально скорости,
    // но задаём минимальное значение, чтобы свет всегда был.
    crystal.traverse((child) => {
      if (child.isMesh && child.material && !isScroll) {
        // Вычисляем интенсивность на основе абсолютной скорости
        let intensity = Math.abs(rotationState.rotationSpeed) / 2;
        // Задаём минимум (например, 0.5) и максимум (например, 3)
        intensity = Math.max(intensity, 0.5);
        intensity = Math.min(intensity, 30);
        child.material.emissiveIntensity = intensity;
        // child.material.roughness = -intensity;
      }
    });
  }
};

export function onMouseMove(event, rotationState, isScroll) {
  const currentTime = performance.now();

  if (
    rotationState.lastMouseX !== null &&
    rotationState.lastTime !== null &&
    !isScroll
  ) {
    const deltaTime = (currentTime - rotationState.lastTime) / 1000; // в секундах
    const deltaX = event.clientX - rotationState.lastMouseX; // изменение позиции
    const speed = deltaX / deltaTime; // пиксели в секунду

    // Добавляем энергию: не перезаписываем, а суммируем с текущей скоростью.
    rotationState.rotationSpeed += speed * 0.0003;

    // Ограничиваем максимальную скорость вращения, если нужно
    const maxRotationSpeed = 10;
    rotationState.rotationSpeed = Math.max(
      -maxRotationSpeed,
      Math.min(rotationState.rotationSpeed, maxRotationSpeed)
    );
  }

  rotationState.lastMouseX = event.clientX;
  rotationState.lastTime = currentTime;
}

const state = { value: 0 };
let tween; // для хранения текущего tween’а
let tl = gsap.timeline();

const planeBG = document.querySelector(".change__bg__color--plane");
const aboutSection = document.querySelector(".about");
const aboutTextBox = document.querySelector(".about__text__box");

export const OnScrollCrystal = (
  currentScroll,
  crystal,
  camera,
  rotationState,
  canvas
) => {
  if (tween) tween.kill();
  tween = gsap.to(state, {
    value: currentScroll,
    duration: 0.5, // длительность анимации (сек)
    ease: "power2.out", // выбранный easing
    onUpdate: () => {
      const crystalRotation = Math.PI / 32;
      const crystalY = 5;
      crystal.position.y = crystalY - state.value / 250;
      crystal.rotation.z = crystalRotation + state.value / 500;

      crystal.position.z = state.value / 50 - 40;
      camera.fov = 50 - state.value / 20;
      camera.updateProjectionMatrix();

      crystal.traverse((child) => {
        if (child.isMesh && child.material) {
          // Вычисляем интенсивность на основе rotationSpeed
          let intensity = Math.abs(rotationState.rotationSpeed) / 2;
          // Ограничиваем диапазон значения интенсивности
          intensity = Math.max(intensity, 0.5);
          intensity = Math.min(intensity, 30);
          child.material.emissiveIntensity =
            intensity * Math.pow(state.value / 300, 3); // Exponential increase
          child.material.roughness = (intensity * state.value) / 800;
          // child.material.roughness = -intensity;
        }
      });

      planeBG.style.backgroundColor = "#fff";

      if (state.value > 650) {
        planeBG.style.opacity = Math.pow((state.value - 650) / 600, 3);
      } else {
        planeBG.style.opacity = 0;
      }
      if (state.value > 1350) {
        planeBG.style.opacity = 0;
        canvas.style.display = "none";
        aboutSection.style.opacity = 1;

        if (!tl.isActive()) {
          tl.to(".char", {
            y: 0,
            stagger: 0.05,
            duration: 0.1,
          });

          aboutTextBox.classList.add("animate__width");
        } else {
          tl.play();
        }
      } else {
        canvas.style.display = "block";
        aboutSection.style.opacity = 0;
      }
    },
  });
};
