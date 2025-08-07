// hooks/useThreeScene.js
import { useRef, useCallback, useEffect } from "react";
import * as THREE from "three";

/**
 * Hook para manejar SOLO la inicialización y cleanup de la escena Three.js
 * Principio SRP: Single Responsibility - Solo maneja la escena base
 */
function useThreeScene() {
   // Referencias de Three.js
   const canvasRef = useRef(null);
   const sceneRef = useRef(null);
   const rendererRef = useRef(null);
   const cameraRef = useRef(null);

   // Inicializar escena Three.js
   const initScene = useCallback(() => {
      if (!canvasRef.current) return false;

      try {
         // 1. Crear escena
         const scene = new THREE.Scene();
         sceneRef.current = scene;

         // 2. Crear cámara perspectiva
         const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
         camera.position.z = 5;
         cameraRef.current = camera;

         // 3. Crear renderer
         const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true, // Fondo transparente para AR
         });
         renderer.setSize(window.innerWidth, window.innerHeight);
         renderer.setClearColor(0x000000, 0); // Transparente
         rendererRef.current = renderer;

         // 4. Agregar luces básicas por defecto
         const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
         scene.add(ambientLight);

         const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
         directionalLight.position.set(1, 1, 1);
         scene.add(directionalLight);

         console.log("Three.js scene initialized successfully");
         return true;
      } catch (error) {
         console.error("Error initializing Three.js scene:", error);
         return false;
      }
   }, []);

   // Renderizar la escena una vez
   const renderScene = useCallback(() => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
         rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
   }, []);

   // Redimensionar escena
   const resizeScene = useCallback(() => {
      if (cameraRef.current && rendererRef.current) {
         cameraRef.current.aspect = window.innerWidth / window.innerHeight;
         cameraRef.current.updateProjectionMatrix();
         rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
   }, []);

   // Limpiar recursos Three.js
   const cleanup = useCallback(() => {
      if (rendererRef.current) {
         rendererRef.current.dispose();
         rendererRef.current = null;
      }

      sceneRef.current = null;
      cameraRef.current = null;

      console.log("Three.js scene cleaned up");
   }, []);

   // Auto-cleanup al desmontar
   useEffect(() => {
      return cleanup;
   }, [cleanup]);

   return {
      // Referencias
      canvasRef,
      sceneRef,
      rendererRef,
      cameraRef,

      // Funciones de control
      initScene,
      renderScene,
      resizeScene,
      cleanup,
   };
}

export default useThreeScene;
