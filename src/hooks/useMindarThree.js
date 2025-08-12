// hooks/useMindarThree.js - Versión corregida sin getAnimationLoop
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import useCameraMind from "./useCameraMind.js";

function useMindarThree(arModel, targetPath) {
   const [modelLoaded, setModelLoaded] = useState(false);
   const [modelError, setModelError] = useState(null);

   // Referencias para el modelo
   const arModelRef = useRef(null);
   const clockRef = useRef(new THREE.Clock());
   const animationIdRef = useRef(null);

   const {
      loading: cameraLoading,
      isTracking,
      error: cameraError,
      sceneRef,
      captureCanvasRef,
      getAnchor,
      getThreeJS,
      captureBasicPhoto,
      capturePhotoWithAR,
      savePhoto,
      quickSaveAR,
   } = useCameraMind(targetPath);

   useEffect(() => {
      if (!arModel || cameraLoading) return;

      const loadARModel = async () => {
         try {
            console.log("🔄 Cargando modelo AR...");

            // El modelo ya viene configurado desde el Factory
            await arModel.load();

            arModelRef.current = arModel;
            setModelLoaded(true);

            console.log("✅ Modelo AR cargado exitosamente");
         } catch (err) {
            console.error("❌ Error cargando modelo AR:", err);
            setModelError(err.message);
         }
      };

      loadARModel();

      return () => {
         if (arModelRef.current) {
            arModelRef.current.dispose();
         }
      };
   }, [arModel, cameraLoading]);

   useEffect(() => {
      if (!modelLoaded || !arModelRef.current) return;

      const anchor = getAnchor();
      if (!anchor) return;

      const model = arModelRef.current;

      model.addToAnchor(anchor);

      const originalTargetFound = anchor.onTargetFound;
      const originalTargetLost = anchor.onTargetLost;

      anchor.onTargetFound = () => {
         console.log("🎯 Target encontrado - mostrando modelo");
         model.show();
         if (originalTargetFound) originalTargetFound();
      };

      anchor.onTargetLost = () => {
         console.log("❌ Target perdido - ocultando modelo");
         model.hide();
         if (originalTargetLost) originalTargetLost();
      };

      return () => {
         model.removeFromAnchor(anchor);
      };
   }, [modelLoaded, getAnchor]);

   useEffect(() => {
      if (!modelLoaded || !arModelRef.current) return;

      const threeJS = getThreeJS();
      if (!threeJS) return;

      const { renderer, scene, camera } = threeJS;

      const originalRender = () => {
         renderer.render(scene, camera);
      };

      const customAnimationLoop = () => {
         const delta = clockRef.current.getDelta();

         if (arModelRef.current && arModelRef.current.isVisible) {
            arModelRef.current.update(delta);
         }

         originalRender();

         animationIdRef.current = requestAnimationFrame(customAnimationLoop);
      };

      if (!renderer.info.render.frame || renderer.info.render.frame === 0) {
         console.log("🎬 Iniciando loop de animación personalizado");
         customAnimationLoop();
      } else {
         // Si ya hay un loop, solo hooks into el existente
         console.log("🔄 Hooking into loop existente");
         const existingLoop = () => {
            const delta = clockRef.current.getDelta();
            if (arModelRef.current && arModelRef.current.isVisible) {
               arModelRef.current.update(delta);
            }
         };

         const intervalId = setInterval(existingLoop, 16);

         return () => {
            clearInterval(intervalId);
         };
      }

      return () => {
         // Limpiar el loop personalizado
         if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
         }
      };
   }, [modelLoaded, getThreeJS]);

   const loading = cameraLoading || !modelLoaded;
   const error = cameraError || modelError;

   const getARModel = () => arModelRef.current;

   const showModel = () => {
      if (arModelRef.current) {
         arModelRef.current.show();
      }
   };

   const hideModel = () => {
      if (arModelRef.current) {
         arModelRef.current.hide();
      }
   };

   const triggerModelAction = (actionName, ...params) => {
      if (!arModelRef.current) return;

      // Llamar método específico del modelo si existe
      if (typeof arModelRef.current[actionName] === "function") {
         arModelRef.current[actionName](...params);
      } else {
         console.warn(`Acción '${actionName}' no disponible para este modelo`);
      }
   };

   return {
      // Estados básicos
      loading,
      isTracking,
      error,
      sceneRef,

      // Funciones de captura
      captureCanvasRef,
      captureBasicPhoto,
      capturePhotoWithAR,
      savePhoto,
      quickSaveAR,

      // Acceso a MindAR
      getAnchor,
      getThreeJS,

      // 🎮 Control del modelo AR
      getARModel,
      showModel,
      hideModel,
      triggerModelAction,

      // Referencias para compatibilidad
      modelRef: arModelRef,
   };
}

export default useMindarThree;
