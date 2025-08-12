// hooks/useThreeScene.js
import { useRef, useCallback, useEffect, useState } from "react";
import * as THREE from "three";

function useThreeScene() {
   const threeCanvasRef = useRef(null);
   const sceneRef = useRef(null);
   const rendererRef = useRef(null);
   const cameraRef = useRef(null);
   const [sceneReady, setSceneReady] = useState(false);

   useEffect(() => {
      const initScene = () => {
         if (!threeCanvasRef.current || sceneReady) return;

         try {
            sceneRef.current = new THREE.Scene();

            cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            cameraRef.current.position.z = 5;

            rendererRef.current = new THREE.WebGLRenderer({
               canvas: threeCanvasRef.current,
               alpha: true,
            });
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            rendererRef.current.setClearColor(0x000000, 0);

            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            sceneRef.current.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            sceneRef.current.add(directionalLight);

            setSceneReady(true);
         } catch (error) {
            console.error("Error initializing Three.js scene:", error);
         }
      };

      const timeoutId = setTimeout(initScene, 100);

      return () => clearTimeout(timeoutId);
   }, [sceneReady]);

   const renderScene = useCallback(() => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
         rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
   }, []);

   const resizeScene = useCallback(() => {
      if (cameraRef.current && rendererRef.current) {
         cameraRef.current.aspect = window.innerWidth / window.innerHeight;
         cameraRef.current.updateProjectionMatrix();
         rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
   }, []);

   const cleanup = useCallback(() => {
      if (rendererRef.current) {
         rendererRef.current.dispose();
      }
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      setSceneReady(false);
   }, []);

   useEffect(() => {
      const handleResize = () => {
         resizeScene();
      };

      if (sceneReady) {
         window.addEventListener("resize", handleResize);
      }

      return () => {
         window.removeEventListener("resize", handleResize);
      };
   }, [resizeScene, sceneReady]);

   return {
      threeCanvasRef,
      sceneRef,
      rendererRef,
      cameraRef,
      sceneReady,
      renderScene,
      resizeScene,
      cleanup,
   };
}

export default useThreeScene;
