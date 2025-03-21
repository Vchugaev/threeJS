export default function applyShake(object, intensity, duration = 80) {
    // Сохраняем исходные координаты объекта
    const originalPosition = {
      x: object.position.x,
      y: object.position.y,
      z: object.position.z,
    };
  
    // Функция для применения тряски
    const shake = () => {
      // Генерируем случайные смещения
      const shakeX = (Math.random() - 0.5) * intensity;
      const shakeY = (Math.random() - 0.5) * intensity;
      const shakeZ = (Math.random() - 0.5) * intensity;
  
      // Применяем смещение к объекту
      object.position.x = originalPosition.x + shakeX;
      object.position.y = originalPosition.y + shakeY;
      object.position.z = originalPosition.z + shakeZ;
    };
  
    // Запускаем тряску
    const interval = setInterval(shake, 32); // ~60 FPS (16ms на кадр)
  
    // Останавливаем тряску через указанное время
    setTimeout(() => {
      clearInterval(interval); // Останавливаем тряску
      object.position.set(originalPosition.x, originalPosition.y, originalPosition.z); // Возвращаем объект в исходное положение
    }, duration);
  }