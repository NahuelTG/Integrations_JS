// hooks/useMindarThree.js
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import useCameraMind from "./useCameraMind.js";

/**
 * Hook completo para MindAR con modelo 3D
 * Usa useCameraMind para la funcionalidad de cámara
 */
function useMindarThree(modelPath, targetPath) {
   const [modelLoaded, setModelLoaded] = useState(false);
   const [modelError, setModelError] = useState(null);

   // Referencias para el modelo
   const modelRef = useRef(null);
   const mixerRef = useRef(null);
   const clockRef = useRef(new THREE.Clock());

   // Usar el hook de cámara (ahora con funcionalidades de captura)
   const {
      loading: cameraLoading,
      isTracking,
      error: cameraError,
      sceneRef,
      captureCanvasRef,
      getAnchor,
      getThreeJS,
      // 📸 Funciones de captura heredadas
      captureBasicPhoto,
      capturePhotoWithAR,
      savePhoto,
      quickSaveAR,
   } = useCameraMind(targetPath);

   // Cargar modelo 3D
   useEffect(() => {
      if (!modelPath || cameraLoading) return;

      const loadModel = async () => {
         try {
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

            setModelLoaded(true);
         } catch (err) {
            console.error("Error cargando modelo:", err);
            setModelError(err.message);
         }
      };

      loadModel();
   }, [modelPath, cameraLoading]);

   // Agregar modelo al anchor cuando esté listo
   useEffect(() => {
      if (!modelLoaded || !modelRef.current) return;

      const anchor = getAnchor();
      if (!anchor) return;

      const model = modelRef.current;

      // Agregar modelo al anchor
      anchor.group.add(model);

      // Configurar eventos de visibilidad
      const originalTargetFound = anchor.onTargetFound;
      const originalTargetLost = anchor.onTargetLost;

      anchor.onTargetFound = () => {
         model.visible = true;
         if (originalTargetFound) originalTargetFound();
      };

      anchor.onTargetLost = () => {
         model.visible = false;
         if (originalTargetLost) originalTargetLost();
      };

      return () => {
         // Limpiar al desmontar
         anchor.group.remove(model);
      };
   }, [modelLoaded, getAnchor]);

   // Loop de animación del modelo
   useEffect(() => {
      if (!modelLoaded || !mixerRef.current) return;

      const threeJS = getThreeJS();
      if (!threeJS) return;

      const { renderer } = threeJS;
      const originalAnimationLoop = renderer.getAnimationLoop();

      // Extender el loop de animación para incluir el modelo
      renderer.setAnimationLoop(() => {
         const delta = clockRef.current.getDelta();

         if (modelRef.current?.visible && mixerRef.current) {
            mixerRef.current.update(delta);
         }

         // Ejecutar el loop original
         if (originalAnimationLoop) {
            originalAnimationLoop();
         }
      });

      return () => {
         renderer.setAnimationLoop(originalAnimationLoop);
      };
   }, [modelLoaded, getThreeJS]);

   // Estados combinados
   const loading = cameraLoading || !modelLoaded;
   const error = cameraError || modelError;

   return {
      loading,
      isTracking,
      error,
      sceneRef,

      captureCanvasRef,
      captureBasicPhoto,
      capturePhotoWithAR,
      savePhoto,
      quickSaveAR,

      getAnchor,
      getThreeJS,

      modelRef,
      mixerRef,
   };
}

export default useMindarThree;
