// models/WolfARModel.js
import { ARModelBase } from "./ARModelBase";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

export class WolfARModel extends ARModelBase {
   constructor(customConfig = {}) {
      // 🐺 Configuración específica del lobo
      const wolfConfig = {
         scale: { x: 0.15, y: 0.15, z: 0.15 },
         position: { x: 0, y: -0.3, z: 0 },
         rotation: { x: 0, y: Math.PI, z: 0 }, // Rotar para que mire al frente
         animationSpeed: 1.2,
         castShadow: true,
         receiveShadow: true,
         // 🎯 Configuraciones específicas del lobo
         howlOnAppear: true,
         eyeGlow: true,
         ...customConfig,
      };

      super(wolfConfig);
      this.modelPath = "/assets/AR/wolf.glb";
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

         // 🐺 Configuraciones específicas del lobo
         this.setupWolfSpecificFeatures();

         return this.model;
      } catch (error) {
         console.error("Error cargando modelo del lobo:", error);
         throw error;
      }
   }

   setupWolfSpecificFeatures() {
      if (!this.model) return;

      // 👁️ Configurar brillo en los ojos si está habilitado
      if (this.config.eyeGlow) {
         this.setupEyeGlow();
      }

      // 🎵 Configurar sonido de aullido
      if (this.config.howlOnAppear) {
         this.setupHowlSound();
      }
   }

   setupEyeGlow() {
      // Buscar los ojos en el modelo y añadir material emisivo
      this.model.traverse((child) => {
         if (child.isMesh && child.name.toLowerCase().includes("eye")) {
            if (child.material) {
               child.material.emissive = new THREE.Color(0x00ff00);
               child.material.emissiveIntensity = 0.3;
            }
         }
      });
   }

   setupHowlSound() {
      // Placeholder para sonido - podrías usar Web Audio API
      console.log("🐺 Lobo configurado con sonido de aullido");
   }

   // 🎬 Método específico para animación de aullido
   playHowlAnimation() {
      const howlAction = this.animations.find((anim) => anim.clip.name.toLowerCase().includes("howl"));

      if (howlAction) {
         howlAction.action.reset().play();
      }
   }
}
