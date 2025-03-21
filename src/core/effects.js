import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  EffectPass,
  SMAAEffect,
} from "postprocessing";

export function InitComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomEffect = new BloomEffect({
    intensity: 0.3,
    kernelSize: 2,
    luminanceThreshold: 0,
    luminanceSmoothing: 1,
    mipmapBlur: true,
  });


  const fxaaEffect = new SMAAEffect();

  // Добавляем пост-обработку эффектов
  composer.addPass(new EffectPass(camera, bloomEffect, fxaaEffect));

  return { composer };
}
