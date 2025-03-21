import * as THREE from "three";
import init from "./init";
const { sizes, camera, scene, canvas, controls, renderer } = init();
import "./style.css";
import gsap from "gsap";
import SplitType from "split-type";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { loadFBX, loadGLRF, loadHDRI } from "./core/loader";
import { InitComposer } from "./core/effects";
import { initDebugUI } from "./core/stats";
import { CrystalRotate, onMouseMove, OnScrollCrystal } from "./core/animations";
import skillList from "./isScroll/list";
import aboutMe, { staticTextAnimation } from "./isScroll/about";
import { GlitchEffect } from "postprocessing";
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';

// Инициализируем Swiper
const swiper = new Swiper('.swiper__container', {
  loop: true,
  speed: 15000,
  autoplay: {
    delay: 0,
    disableOnInteraction: false,
    pauseOnMouseEnter: false,
    reverseDirection: false
  },
  classname: 'swiper-transition',
  modules: [Autoplay],
  slidesPerView: '5',
  allowTouchMove: false,
  resistanceRatio: 0,
});
const swipers = new Swiper('.swiper__container2', {
  loop: true,
  speed: 15000,
  autoplay: {
    delay: 0,
    disableOnInteraction: false,
    pauseOnMouseEnter: false,
    reverseDirection: true
  },
  classname: 'swiper-transition',
  modules: [Autoplay],
  slidesPerView: '5',
  allowTouchMove: false,
  resistanceRatio: 0,
});



gsap.registerPlugin(ScrollTrigger);
const myText = new SplitType(".chugaev");

let isScroll = false;

loadHDRI("./models/fantasy/Space_21.hdr", scene);




let crystal = await loadGLRF("./models/crystal/scene.gltf", scene);
const { composer } = InitComposer(renderer, scene, camera);
let stats = initDebugUI(camera, crystal);
document.documentElement.scrollTop;

camera.position.set(0, 0, 0);
camera.rotation.set(Math.PI * 2.03, -Math.PI * 2.02, -0.08);
controls.enabled = true;

let rotationState = {
  rotationSpeed: 0,
  lastMouseX: null,
  lastTime: null,
};

const clock = new THREE.Clock();

const tick = () => {
  const delta = clock.getDelta();
  const currentScroll = window.scrollY;
  stats.begin();
  window.requestAnimationFrame(tick);
  CrystalRotate(crystal, rotationState, delta, isScroll, currentScroll);
  composer.render();
  stats.end();
};
tick();

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  OnScrollCrystal(currentScroll, crystal, camera, rotationState, canvas);

  

  if (currentScroll > 300) {
    isScroll = true;
  } else {
    isScroll = false;
  }
  aboutMe(currentScroll);
  skillList(currentScroll);
  staticTextAnimation()
});

window.addEventListener(
  "mousemove",
  (event) => onMouseMove(event, rotationState, isScroll),
  false
);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  composer.render(scene, camera);
});

