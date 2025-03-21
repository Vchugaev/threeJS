import gsap from "gsap";
import SplitType from "split-type";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let flag = false;
export default function aboutMe(currentScroll) {
  if (!flag) {
    flag = true;

    let tl = gsap.timeline(),
      mySplitText = new SplitType(".random__text", { type: "words,chars" }),
      words = mySplitText.words;

    const initialValues = words.map((word) => ({
      x: gsap.utils.random(-700, 700),
      y: gsap.utils.random(-500, 500),
      rotation: gsap.utils.random(-360, 360),
    }));

    tl.from(mySplitText.words, {
      duration: 4, // Время разлета
      scale: 1.8, // Буквы увеличиваются перед разлетом
      x: (index) => initialValues[index].x,
      rotation: (index) => initialValues[index].rotation, // Вращение хаотично
      ease: "power3.out", // Плавный разлет
    });
  }
}

let flag2 = false;
export const staticTextAnimation = () => {
  if (!flag2) {
    flag2 = true;
    const split = new SplitType(".static-text", { types: "words,chars" });

    
    gsap.set(split.words, {
      x: () => gsap.utils.random(-150, 150),
      y: () => gsap.utils.random(-100, 100),
      rotation: () => gsap.utils.random(-45, 45),
      opacity: 0,
    });

    
    split.words.forEach((words) => {
      gsap.to(words, {
        opacity: 1,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        repeatDelay: gsap.utils.random(0.3, 1.5),
        ease: "sine.inOut",
      });
    });
  }
};
