// hooks/useMindarThree.js
import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

function useMindarThree(imageTargetSrc, options = {}) {
   // Estados del sistema AR
   const [mindarReady, setMindarReady] = useState(false);
   const [isTracking, setIsTracking] = useState(false);
   const [error, setError] = useState(null);
   const [isStarted, setIsStarted] = useState(false);

   // Referencias de MindAR
   const mindarRef = useRef(null);
   const containerRef = useRef(null);

   // Configuración por defecto
   const defaultOptions = useMemo(
      () => ({
         uiLoading: "no",
         uiScanning: "yes",
         uiError: "yes",
         maxTrack: 1,
         filterMinCF: 0.0001,
         filterBeta: 0.001,
         warmupTolerance: 5,
         missTolerance: 5,
         ...options,
      }),
      [options]
   );

   // Inicializar MindAR
   const initMindAR = useCallback(async () => {
      if (!imageTargetSrc) {
         setError("imageTargetSrc es requerido para MindAR");
         return false;
      }

      if (mindarRef.current) {
         console.log("MindAR ya está inicializado");
         return true;
      }

      try {
         setError(null);
         console.log("🎯 Inicializando MindAR...");

         // Crear instancia de MindAR
         const mindarThree = new MindARThree({
            container: containerRef.current || document.body,
            imageTargetSrc: imageTargetSrc,
            ...defaultOptions,
         });

         mindarRef.current = mindarThree;

         // Configurar event listeners
         setupEventListeners(mindarThree);

         setMindarReady(true);
         console.log("✅ MindAR inicializado correctamente");
         return true;
      } catch (err) {
         console.error("❌ Error inicializando MindAR:", err);
         setError(`Error al inicializar MindAR: ${err.message}`);
         return false;
      }
   }, [imageTargetSrc, defaultOptions, setupEventListeners]);

   // Configurar event listeners de MindAR
   const setupEventListeners = useCallback((mindarThree) => {
      // Cuando se detecta un target
      mindarThree.addTargetListener("targetFound", (targetIndex) => {
         console.log(`🎯 Target encontrado: ${targetIndex}`);
         setIsTracking(true);
      });

      // Cuando se pierde un target
      mindarThree.addTargetListener("targetLost", (targetIndex) => {
         console.log(`❌ Target perdido: ${targetIndex}`);
         setIsTracking(false);
      });
   }, []);

   // Iniciar MindAR
   const startMindAR = useCallback(async () => {
      if (!mindarRef.current) {
         console.log("MindAR no está inicializado");
         return false;
      }

      if (isStarted) {
         console.log("MindAR ya está iniciado");
         return true;
      }

      try {
         console.log("🚀 Iniciando MindAR...");
         await mindarRef.current.start();
         setIsStarted(true);
         console.log("✅ MindAR iniciado correctamente");
         return true;
      } catch (err) {
         console.error("❌ Error iniciando MindAR:", err);
         setError(`Error al iniciar MindAR: ${err.message}`);
         return false;
      }
   }, [isStarted]);

   // Detener MindAR
   const stopMindAR = useCallback(async () => {
      if (!mindarRef.current || !isStarted) {
         return;
      }

      try {
         console.log("⏹️ Deteniendo MindAR...");
         await mindarRef.current.stop();
         setIsStarted(false);
         setIsTracking(false);
         console.log("✅ MindAR detenido");
      } catch (err) {
         console.error("❌ Error deteniendo MindAR:", err);
         setError(`Error al detener MindAR: ${err.message}`);
      }
   }, [isStarted]);

   // Obtener anchor (punto de anclaje para objetos 3D)
   const getAnchor = useCallback((targetIndex = 0) => {
      if (!mindarRef.current) {
         console.log("MindAR no está disponible");
         return null;
      }

      try {
         return mindarRef.current.addAnchor(targetIndex);
      } catch (err) {
         console.error("Error obteniendo anchor:", err);
         return null;
      }
   }, []);

   // Agregar objeto 3D a un target específico
   const addObjectToTarget = useCallback(
      (object3D, targetIndex = 0) => {
         const anchor = getAnchor(targetIndex);
         if (anchor && object3D) {
            anchor.group.add(object3D);
            console.log(`📦 Objeto agregado al target ${targetIndex}`);
            return anchor;
         }
         return null;
      },
      [getAnchor]
   );

   // Auto-inicialización cuando hay imageTargetSrc
   useEffect(() => {
      if (imageTargetSrc && !mindarReady) {
         initMindAR();
      }
   }, [imageTargetSrc, mindarReady, initMindAR]);

   // Cleanup automático
   useEffect(() => {
      return () => {
         if (mindarRef.current && isStarted) {
            stopMindAR();
         }
      };
   }, [isStarted, stopMindAR]);

   // Exponer propiedades de Three.js de MindAR (solo lectura)
   const scene = mindarRef.current?.scene || null;
   const camera = mindarRef.current?.camera || null;
   const renderer = mindarRef.current?.renderer || null;

   return {
      // Estados
      mindarReady,
      isTracking,
      isStarted,
      error,

      // Referencias
      containerRef,
      mindarRef,

      // Three.js objects (de MindAR)
      scene,
      camera,
      renderer,

      // Funciones de control
      initMindAR,
      startMindAR,
      stopMindAR,

      // Funciones para objetos 3D
      getAnchor,
      addObjectToTarget,

      // Configuración
      imageTargetSrc,
   };
}

export default useMindarThree;
