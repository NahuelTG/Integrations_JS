// hooks/useMindarThree.js
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function useMindarThree(modelPath, targetPath) {
   const [loading, setLoading] = useState(true);
   const [isTracking, setIsTracking] = useState(false);
   const [error, setError] = useState(null);

   // Referencias
   const sceneRef = useRef(null);
   const mindarRef = useRef(null);
   const modelRef = useRef(null);
   const mixerRef = useRef(null);
   const clockRef = useRef(new THREE.Clock());

   useEffect(() => {
      if (!modelPath || !targetPath || !sceneRef.current) return;

      let cleanup = null;

      const init = async () => {
         try {
            // Crear instancia de MindAR
            const mindar = new MindARThree({
               container: sceneRef.current,
               imageTargetSrc: targetPath,
            });

            mindarRef.current = mindar;
            const { renderer, scene, camera } = mindar;

            // Luces básicas
            scene.add(new THREE.AmbientLight(0xffffff, 0.8));
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

            // Cargar modelo
            const loader = new GLTFLoader();
            const gltf = await new Promise((resolve, reject) => {
               loader.load(modelPath, resolve, undefined, reject);
            });

            const model = gltf.scene;
            model.scale.set(0.1, 0.1, 0.1);
            model.position.set(0, -0.2, 0);
            model.visible = false;

            modelRef.current = model;

            // Configurar animaciones
            if (gltf.animations.length > 0) {
               mixerRef.current = new THREE.AnimationMixer(model);
               gltf.animations.forEach((clip) => {
                  const action = mixerRef.current.clipAction(clip);
                  action.play();
               });
            }

            // Crear anchor y eventos
            const anchor = mindar.addAnchor(0);
            anchor.group.add(model);

            anchor.onTargetFound = () => {
               model.visible = true;
               setIsTracking(true);
            };

            anchor.onTargetLost = () => {
               model.visible = false;
               setIsTracking(false);
            };

            // Iniciar MindAR
            await mindar.start();

            // Loop de renderizado
            renderer.setAnimationLoop(() => {
               const delta = clockRef.current.getDelta();

               if (model.visible && mixerRef.current) {
                  mixerRef.current.update(delta);
               }

               renderer.render(scene, camera);
            });

            setLoading(false);

            // Función de limpieza
            cleanup = () => {
               renderer.setAnimationLoop(null);
               mindar.stop();
            };
         } catch (err) {
            console.error("Error inicializando MindAR:", err);
            setError(err.message);
            setLoading(false);
         }
      };

      init();

      return () => cleanup?.();
   }, [modelPath, targetPath]);

   return {
      loading,
      isTracking,
      error,
      sceneRef,
   };
}

export default useMindarThree;
