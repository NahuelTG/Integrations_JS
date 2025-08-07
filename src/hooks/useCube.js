// hooks/useCube.js
import { useRef, useCallback, useState } from "react";
import * as THREE from "three";

/**
 * Hook para manejar SOLO la creación y control del cubo
 * Principio SRP: Single Responsibility - Solo maneja el cubo
 */
function useCube() {
   const cubeRef = useRef(null);
   const [isVisible, setIsVisible] = useState(true);

   // Crear el cubo
   const createCube = useCallback((scene) => {
      if (!scene) {
         console.error("Scene is required to create cube");
         return false;
      }

      try {
         // Crear geometría del cubo
         const geometry = new THREE.BoxGeometry(2, 2, 2);

         // Crear material del cubo
         const material = new THREE.MeshPhongMaterial({
            color: 0x00ff88, // Verde
            shininess: 100,
            transparent: true,
            opacity: 0.8,
         });

         // Crear mesh del cubo
         const cube = new THREE.Mesh(geometry, material);
         cubeRef.current = cube;

         // Agregar a la escena
         scene.add(cube);

         console.log("Cube created and added to scene");
         return true;
      } catch (error) {
         console.error("Error creating cube:", error);
         return false;
      }
   }, []);

   // Mostrar/ocultar cubo
   const toggleVisibility = useCallback(() => {
      if (cubeRef.current) {
         cubeRef.current.visible = !isVisible;
         setIsVisible(!isVisible);
      }
   }, [isVisible]);

   // Actualizar rotación del cubo (llamada desde animación)
   const updateRotation = useCallback(() => {
      if (cubeRef.current) {
         cubeRef.current.rotation.x += 0.01;
         cubeRef.current.rotation.y += 0.01;
      }
   }, []);

   // Remover cubo de la escena
   const removeCube = useCallback((scene) => {
      if (cubeRef.current && scene) {
         scene.remove(cubeRef.current);

         // Limpiar geometría y material
         if (cubeRef.current.geometry) {
            cubeRef.current.geometry.dispose();
         }
         if (cubeRef.current.material) {
            cubeRef.current.material.dispose();
         }

         cubeRef.current = null;
         console.log("Cube removed and cleaned up");
      }
   }, []);

   // Obtener posición actual del cubo
   const getCubePosition = useCallback(() => {
      return cubeRef.current ? cubeRef.current.position : null;
   }, []);

   // Cambiar color del cubo
   const changeCubeColor = useCallback((hexColor) => {
      if (cubeRef.current && cubeRef.current.material) {
         cubeRef.current.material.color.setHex(hexColor);
      }
   }, []);

   return {
      // Estado
      isVisible,

      // Referencia
      cubeRef,

      // Funciones de control
      createCube,
      toggleVisibility,
      updateRotation,
      removeCube,
      getCubePosition,
      changeCubeColor,
   };
}

export default useCube;
