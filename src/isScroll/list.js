import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";
gsap.registerPlugin(ScrollTrigger);

let flag = false;
const skillList = (currentScroll) => {
  if (flag) {
    flag = true;

    const skillContainers = gsap.utils.toArray(".skills__container");

    skillContainers.forEach((container, index) => {
      const skillItems = container.querySelectorAll(".skills__item");
      const textElements = container.querySelectorAll(".skills_skill");

      // Рассчитываем общую ширину всех элементов
      let listWidth = 0;
      skillItems.forEach((item) => {
        listWidth += item.offsetWidth;
      });

      // Клонируем элементы и добавляем их в конец списка
      const clonedItems = Array.from(skillItems).map((item) => item.cloneNode(true));
      container.append(...clonedItems);

      // Для нечётных элементов начинаем с конца
      if (index % 2 !== 0) {
        gsap.set([skillItems, clonedItems], { x: listWidth }); // Устанавливаем начальную позицию вправо
      }

      // Определяем направление движения: чётные — влево, нечётные — вправо
      const direction = index % 2 === 0 ? -1 : 1; // -1 = влево, 1 = вправо

      // Анимация движения
      gsap.to([skillItems, clonedItems], {
        x: direction * listWidth, // Двигаем влево или вправо
        duration: 20, // Время анимации (можно настроить)
        ease: "none",
        repeat: -1, // Бесконечное повторение
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % listWidth), // Зацикливание
        },
      });
    });
  }
};

export default skillList;