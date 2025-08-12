// hooks/useCube.js
import { useRef, useState, useEffect, useCallback } from "react";
import * as THREE from "three";

function useCube(sceneRef, rendererRef, cameraRef, sceneReady) {
   const [showCube, setShowCube] = useState(true);
   const cubeRef = useRef(null);
   const animationIdRef = useRef(null);

   useEffect(() => {
      const scene = sceneRef.current;

      if (sceneReady && scene && !cubeRef.current) {
         const geometry = new THREE.BoxGeometry(2, 2, 2);
         const material = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            shininess: 100,
            transparent: true,
            opacity: 0.8,
         });
         const cube = new THREE.Mesh(geometry, material);
         cubeRef.current = cube;
         scene.add(cube);
      }
      return () => {
         const cube = cubeRef.current;

         if (scene && cube) {
            scene.remove(cube);
            cube.geometry.dispose();
            cube.material.dispose();
            cubeRef.current = null;
         }
      };
   }, [sceneReady, sceneRef]);

   const animate = useCallback(() => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (cubeRef.current) {
         cubeRef.current.rotation.x += 0.01;
         cubeRef.current.rotation.y += 0.01;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
         rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
   }, [rendererRef, sceneRef, cameraRef]);

   useEffect(() => {
      if (cubeRef.current && sceneReady && !animationIdRef.current) {
         animate();
      }

      return () => {
         if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
         }
      };
   }, [sceneReady, animate]);

   const toggleCube = useCallback(() => {
      setShowCube((prev) => {
         const newShowCube = !prev;
         if (cubeRef.current) {
            cubeRef.current.visible = newShowCube;
         }
         return newShowCube;
      });
   }, []);

   return {
      showCube,
      toggleCube,
      cubeRef,
   };
}

export default useCube;
