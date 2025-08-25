// hooks/useThreeJS.js
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

export const useThreeJS = (canvasRef) => {
   const [isReady, setIsReady] = useState(false);

   const sceneRef = useRef(null);
   const cameraRef = useRef(null);
   const rendererRef = useRef(null);
   const reticleRef = useRef(null);
   const pointerRef = useRef(null);

   useEffect(() => {
      const init = () => {
         if (!canvasRef.current || isReady) return;

         try {
            // Scene
            sceneRef.current = new THREE.Scene();

            // Camera
            cameraRef.current = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

            // Renderer
            rendererRef.current = new THREE.WebGLRenderer({
               canvas: canvasRef.current,
               antialias: true,
               alpha: true,
            });
            rendererRef.current.setPixelRatio(window.devicePixelRatio);
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            rendererRef.current.xr.enabled = true;
            rendererRef.current.shadowMap.enabled = true;
            rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;

            // Lighting
            const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
            light.position.set(0.5, 1, 1);
            sceneRef.current.add(light);

            // Reticle
            const reticle = new THREE.Mesh(
               new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
               new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            );
            reticle.matrixAutoUpdate = false;
            reticle.visible = false;
            reticleRef.current = reticle;
            sceneRef.current.add(reticle);

            // Pointer
            const pointer = new THREE.Mesh(new THREE.SphereGeometry(0.02), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
            pointer.visible = false;
            pointerRef.current = pointer;
            sceneRef.current.add(pointer);

            setIsReady(true);
         } catch (error) {
            console.error("Error inicializando Three.js:", error);
         }
      };

      const timeoutId = setTimeout(init, 100);
      return () => clearTimeout(timeoutId);
   }, [isReady, canvasRef]);

   return {
      isReady,
      scene: sceneRef.current,
      camera: cameraRef.current,
      renderer: rendererRef.current,
      reticle: reticleRef.current,
      pointer: pointerRef.current,
   };
};
