// models/ARModelBase.js
import * as THREE from "three";

/**
 * Clase base para todos los modelos AR
 * Implementa Factory + Strategy Pattern
 */
export class ARModelBase {
   constructor(config = {}) {
      this.config = {
         // 📏 Configuraciones de escala y posición
         scale: { x: 0.1, y: 0.1, z: 0.1 },
         position: { x: 0, y: -0.2, z: 0 },
         rotation: { x: 0, y: 0, z: 0 },

         // 🎬 Configuraciones de animación
         autoPlay: true,
         animationSpeed: 1.0,

         // 🎨 Configuraciones visuales
         castShadow: true,
         receiveShadow: true,

         // 📱 Configuraciones de interacción
         interactive: false,

         // 🔧 Configuraciones específicas del modelo
         ...config,
      };

      this.model = null;
      this.mixer = null;
      this.animations = [];
      this.isLoaded = false;
      this.isVisible = false;
   }

   /**
    * Método que debe ser implementado por cada modelo específico
    */
   async load() {
      throw new Error("El método load() debe ser implementado por la clase derivada");
   }

   /**
    * Configurar el modelo después de cargar
    */
   configure() {
      if (!this.model) return;

      // Aplicar escala
      this.model.scale.set(this.config.scale.x, this.config.scale.y, this.config.scale.z);

      // Aplicar posición
      this.model.position.set(this.config.position.x, this.config.position.y, this.config.position.z);

      // Aplicar rotación
      this.model.rotation.set(this.config.rotation.x, this.config.rotation.y, this.config.rotation.z);

      // Configurar sombras
      this.model.traverse((child) => {
         if (child.isMesh) {
            child.castShadow = this.config.castShadow;
            child.receiveShadow = this.config.receiveShadow;
         }
      });

      this.isLoaded = true;
   }

   /**
    * Configurar animaciones
    */
   setupAnimations(gltf) {
      if (gltf.animations.length > 0) {
         this.mixer = new THREE.AnimationMixer(this.model);

         gltf.animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            action.setEffectiveTimeScale(this.config.animationSpeed);

            if (this.config.autoPlay) {
               action.play();
            }

            this.animations.push({ clip, action });
         });
      }
   }

   /**
    * Actualizar animaciones
    */
   update(delta) {
      if (this.mixer && this.isVisible) {
         this.mixer.update(delta);
      }
   }

   /**
    * Mostrar modelo
    */
   show() {
      if (this.model) {
         this.model.visible = true;
         this.isVisible = true;
      }
   }

   /**
    * Ocultar modelo
    */
   hide() {
      if (this.model) {
         this.model.visible = false;
         this.isVisible = false;
      }
   }

   /**
    * Añadir al anchor
    */
   addToAnchor(anchor) {
      if (this.model && anchor) {
         anchor.group.add(this.model);
      }
   }

   /**
    * Remover del anchor
    */
   removeFromAnchor(anchor) {
      if (this.model && anchor) {
         anchor.group.remove(this.model);
      }
   }

   /**
    * Limpiar recursos
    */
   dispose() {
      if (this.mixer) {
         this.mixer.stopAllAction();
      }

      if (this.model) {
         this.model.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
               if (Array.isArray(child.material)) {
                  child.material.forEach((mat) => mat.dispose());
               } else {
                  child.material.dispose();
               }
            }
         });
      }
   }
}
