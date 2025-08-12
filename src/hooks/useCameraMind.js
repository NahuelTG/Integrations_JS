// hooks/useCameraMind.js
import { useState, useEffect, useRef } from "react";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

import * as THREE from "three";

function useCameraMind(targetPath) {
   const [loading, setLoading] = useState(true);
   const [isTracking, setIsTracking] = useState(false);
   const [error, setError] = useState(null);

   const sceneRef = useRef(null);
   const mindarRef = useRef(null);
   const anchorRef = useRef(null);

   useEffect(() => {
      if (!targetPath || !sceneRef.current) return;

      let cleanup = null;

      const initCamera = async () => {
         try {
            const mindar = new MindARThree({
               container: sceneRef.current,
               imageTargetSrc: targetPath,
               uiLoading: "no",
               uiScanning: "no",
               uiError: "no",
            });

            mindarRef.current = mindar;
            const { renderer, scene, camera } = mindar;

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

            const anchor = mindar.addAnchor(0);
            anchorRef.current = anchor;

            anchor.onTargetFound = () => {
               setIsTracking(true);
            };

            anchor.onTargetLost = () => {
               setIsTracking(false);
            };

            await mindar.start();

            renderer.setAnimationLoop(() => {
               renderer.render(scene, camera);
            });

            setLoading(false);

            cleanup = () => {
               renderer.setAnimationLoop(null);
               mindar.stop();
            };
         } catch (err) {
            console.error("Error inicializando cámara MindAR:", err);
            setError(err.message);
            setLoading(false);
         }
      };

      initCamera();

      return () => cleanup?.();
   }, [targetPath]);

   // Función para obtener el anchor (donde se pueden agregar objetos)
   const getAnchor = () => anchorRef.current;

   // Función para obtener la instancia completa de MindAR
   const getMindAR = () => mindarRef.current;

   // Función para obtener scene, camera, renderer
   const getThreeJS = () => {
      if (!mindarRef.current) return null;
      const { scene, camera, renderer } = mindarRef.current;
      return { scene, camera, renderer };
   };

   return {
      loading,
      isTracking,
      error,

      sceneRef,

      getAnchor,
      getMindAR,
      getThreeJS,
   };
}

export default useCameraMind;
