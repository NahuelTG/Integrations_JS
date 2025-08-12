// models/DragonARModel.js - Ejemplo de otro modelo
import { ARModelBase } from "./ARModelBase";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class DragonARModel extends ARModelBase {
   constructor(customConfig = {}) {
      const dragonConfig = {
         scale: { x: 0.2, y: 0.2, z: 0.2 },
         position: { x: 0, y: 0, z: 0 },
         rotation: { x: 0, y: 0, z: 0 },
         animationSpeed: 0.8,
         // 🐉 Configuraciones específicas del dragón
         breathFire: true,
         wingFlap: true,
         ...customConfig,
      };

      super(dragonConfig);
      this.modelPath = "/assets/AR/dragon.glb";
   }

   async load() {
      try {
         const loader = new GLTFLoader();
         const gltf = await new Promise((resolve, reject) => {
            loader.load(this.modelPath, resolve, undefined, reject);
         });

         this.model = gltf.scene;
         this.setupAnimations(gltf);
         this.configure();
         this.setupDragonSpecificFeatures();

         return this.model;
      } catch (error) {
         console.error("Error cargando modelo del dragón:", error);
         throw error;
      }
   }

   setupDragonSpecificFeatures() {
      // Configuraciones específicas del dragón
      if (this.config.breathFire) {
         this.setupFireBreathing();
      }
   }

   setupFireBreathing() {
      // Sistema de partículas para fuego
      console.log("🔥 Dragón configurado con respiración de fuego");
   }

   breatheFire() {
      // Activar animación de respirar fuego
      const fireAction = this.animations.find((anim) => anim.clip.name.toLowerCase().includes("fire"));

      if (fireAction) {
         fireAction.action.reset().play();
      }
   }
}
