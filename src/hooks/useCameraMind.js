// hooks/useCameraMind.js
import { useState, useEffect, useRef, useCallback } from "react";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import * as THREE from "three";

function useCameraMind(targetPath) {
   const [loading, setLoading] = useState(true);
   const [isTracking, setIsTracking] = useState(false);
   const [error, setError] = useState(null);

   const sceneRef = useRef(null);
   const mindarRef = useRef(null);
   const anchorRef = useRef(null);

   const captureCanvasRef = useRef(null);

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
               maxTrack: 1,
               warmupTolerance: 5,
               missTolerance: 5,
               video: {
                  width: { ideal: 1920, max: 1920 },
                  height: { ideal: 1080, max: 1080 },
                  facingMode: "environment",
                  frameRate: { ideal: 30, max: 60 },
                  aspectRatio: { ideal: 16 / 9 },
                  resizeMode: "crop-and-scale",
               },
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

   const captureBasicPhoto = useCallback(() => {
      if (!mindarRef.current || !captureCanvasRef.current) {
         console.log("Referencias no disponibles para captura básica");
         return null;
      }

      try {
         const canvas = captureCanvasRef.current;
         const context = canvas.getContext("2d");

         const video = mindarRef.current.video;
         if (!video) {
            console.log("Video de cámara no disponible");
            return null;
         }

         canvas.width = video.videoWidth || 1920;
         canvas.height = video.videoHeight || 1080;

         context.drawImage(video, 0, 0, canvas.width, canvas.height);

         console.log("📸 Foto básica capturada");
         return canvas.toDataURL("image/jpeg", 0.9);
      } catch (error) {
         console.error("Error en captura básica:", error);
         setError("Error al capturar foto básica");
         return null;
      }
   }, []);

   // 🎯 Función para capturar foto con elementos AR
   const capturePhotoWithAR = useCallback(() => {
      if (!mindarRef.current || !captureCanvasRef.current) {
         console.log("Referencias no disponibles para captura AR");
         return null;
      }

      try {
         const { scene, camera } = mindarRef.current;
         const canvas = captureCanvasRef.current;
         const context = canvas.getContext("2d");

         // Obtener el video de la cámara
         const video = mindarRef.current.video;
         if (!video) {
            console.log("Video de cámara no disponible");
            return null;
         }

         // Configurar canvas
         canvas.width = video.videoWidth || 1920;
         canvas.height = video.videoHeight || 1080;

         // 1. Dibujar el fondo de la cámara
         context.drawImage(video, 0, 0, canvas.width, canvas.height);

         // 2. Si hay tracking, renderizar elementos AR encima
         if (isTracking) {
            // Crear canvas temporal para renderizar Three.js
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            const tempRenderer = new THREE.WebGLRenderer({
               canvas: tempCanvas,
               alpha: true,
               preserveDrawingBuffer: true,
            });

            tempRenderer.setSize(canvas.width, canvas.height);
            tempRenderer.setClearColor(0x000000, 0); // Fondo transparente

            // Renderizar la escena AR
            tempRenderer.render(scene, camera);

            // Combinar el render AR con el video
            context.drawImage(tempCanvas, 0, 0);

            // Limpiar renderer temporal
            tempRenderer.dispose();
            console.log("📸 Foto AR capturada con elementos 3D");
         } else {
            console.log("📸 Foto AR capturada sin tracking");
         }

         return canvas.toDataURL("image/jpeg", 0.9);
      } catch (error) {
         console.error("Error en captura AR:", error);
         setError("Error al capturar foto AR");
         return null;
      }
   }, [isTracking]);

   // 💾 Función para guardar foto
   const savePhoto = useCallback((photoDataUrl, format = "jpeg", filename) => {
      if (!photoDataUrl) {
         setError("No hay foto para guardar");
         return false;
      }

      try {
         const link = document.createElement("a");
         link.href = photoDataUrl;

         const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
         const extension = format === "png" ? ".png" : ".jpg";
         const finalFilename = filename || `ar_photo_${timestamp}${extension}`;

         link.download = finalFilename;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);

         console.log(`💾 Foto guardada: ${finalFilename}`);
         return true;
      } catch (err) {
         console.error("Error guardando foto:", err);
         setError("Error al guardar la foto");
         return false;
      }
   }, []);

   // 🚀 Función para captura rápida (captura + guarda automáticamente)
   const quickSaveAR = useCallback(
      (filename) => {
         const photo = capturePhotoWithAR();
         if (photo) {
            return savePhoto(photo, "jpeg", 0.9, filename);
         }
         return false;
      },
      [capturePhotoWithAR, savePhoto]
   );

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
      // Estados
      loading,
      isTracking,
      error,

      // Referencia del contenedor
      sceneRef,

      // Referencia para captura (canvas oculto)
      captureCanvasRef,

      // Funciones para acceder a MindAR
      getAnchor,
      getMindAR,
      getThreeJS,

      // 📸 Funciones de captura
      captureBasicPhoto,
      capturePhotoWithAR,
      savePhoto,
      quickSaveAR,
   };
}

export default useCameraMind;
