// hooks/useCubeManager.js
import { useState, useRef, useCallback } from "react";
import * as THREE from "three";

export const useCubeManager = (scene, reticle) => {
   const [cubeCount, setCubeCount] = useState(0);
   const cubesRef = useRef([]);
   const isUIInteractionRef = useRef(false);

   const addCube = useCallback(() => {
      if (!reticle?.visible || !scene) return;

      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const material = new THREE.MeshLambertMaterial({
         color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.receiveShadow = true;

      const position = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
      cube.position.copy(position);
      cube.position.y += 0.05;

      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      scene.add(cube);
      cubesRef.current.push(cube);
      setCubeCount(cubesRef.current.length);
   }, [scene, reticle]);

   const handleUIAddCube = useCallback(() => {
      isUIInteractionRef.current = true;
      addCube();
   }, [addCube]);

   const removeLastCube = useCallback(() => {
      if (cubesRef.current.length === 0) return;

      isUIInteractionRef.current = true;

      const lastCube = cubesRef.current.pop();
      scene.remove(lastCube);
      lastCube.geometry.dispose();
      lastCube.material.dispose();
      setCubeCount(cubesRef.current.length);
   }, [scene]);

   const removeAllCubes = useCallback(() => {
      isUIInteractionRef.current = true;

      cubesRef.current.forEach((cube) => {
         scene.remove(cube);
         cube.geometry.dispose();
         cube.material.dispose();
      });

      cubesRef.current = [];
      setCubeCount(0);
   }, [scene]);

   const shouldIgnoreSelect = useCallback(() => {
      if (isUIInteractionRef.current) {
         isUIInteractionRef.current = false;
         return true;
      }
      return false;
   }, []);

   return {
      cubes: cubesRef.current,
      cubeCount,
      addCube,
      handleUIAddCube,
      removeLastCube,
      removeAllCubes,
      shouldIgnoreSelect,
   };
};
