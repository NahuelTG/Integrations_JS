// hooks/useCameraThree.js
import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

function useCameraThree() {
   const [isActive, setIsActive] = useState(false);
   const [error, setError] = useState(null);
   const [hasPermission, setHasPermission] = useState(null);
   const [currentFacingMode, setCurrentFacingMode] = useState("environment");

   const videoRef = useRef(null);
   const captureCanvasRef = useRef(null);
   const streamRef = useRef(null);

   const startCamera = useCallback(
      async (facingMode = currentFacingMode) => {
         try {
            setError(null);

            const constraints = {
               video: {
                  width: { ideal: 1920, max: 1920 },
                  height: { ideal: 1080, max: 1080 },
                  facingMode: facingMode,
               },
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

            streamRef.current = mediaStream;
            setCurrentFacingMode(facingMode);
            setIsActive(true);
            setHasPermission(true);

            if (videoRef.current) {
               videoRef.current.srcObject = mediaStream;
            }
         } catch (err) {
            console.error("Error accediendo a la cámara:", err);
            setError("No se pudo acceder a la cámara");
            setHasPermission(false);
         }
      },
      [currentFacingMode]
   );

   const stopCamera = useCallback(() => {
      if (streamRef.current) {
         streamRef.current.getTracks().forEach((track) => {
            track.stop();
         });
      }
      setIsActive(false);
   }, []);

   const captureBasicPhoto = useCallback(() => {
      if (!videoRef.current || !captureCanvasRef.current || !isActive) {
         setError("Cámara no disponible para capturar");
         return null;
      }

      const video = videoRef.current;
      const canvas = captureCanvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      return canvas.toDataURL("image/jpeg", 0.9);
   }, [isActive]);

   const capturePhotoWith3D = useCallback((sceneRef, rendererRef, cameraRef, showObjects = true) => {
      if (!videoRef.current || !captureCanvasRef.current) {
         console.log("Referencias de cámara no disponibles para captura 3D");
         return null;
      }

      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
         console.log("Referencias de Three.js no disponibles para captura 3D");
         return null;
      }

      const video = videoRef.current;
      const canvas = captureCanvasRef.current;
      const context = canvas.getContext("2d");

      try {
         canvas.width = video.videoWidth;
         canvas.height = video.videoHeight;

         context.drawImage(video, 0, 0);

         if (showObjects) {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;

            const tempRenderer = new THREE.WebGLRenderer({
               canvas: tempCanvas,
               alpha: true,
            });
            tempRenderer.setSize(video.videoWidth, video.videoHeight);
            tempRenderer.setClearColor(0x000000, 0);

            const tempCamera = new THREE.PerspectiveCamera(75, video.videoWidth / video.videoHeight, 0.1, 1000);
            tempCamera.position.z = 5;

            tempRenderer.render(sceneRef.current, tempCamera);

            context.drawImage(tempCanvas, 0, 0);

            tempRenderer.dispose();
         } else {
            console.log("📸 Captura básica sin objetos 3D");
         }

         return canvas.toDataURL("image/jpeg", 0.9);
      } catch (error) {
         console.error("Error en captura 3D:", error);
         setError("Error al capturar foto con elementos 3D");
         return null;
      }
   }, []);

   const savePhoto = useCallback((photoDataUrl, format = "jpeg", quality = 0.9, filename) => {
      if (!photoDataUrl) {
         setError("No hay foto para guardar");
         return false;
      }

      try {
         const canvas = document.createElement("canvas");
         const ctx = canvas.getContext("2d");
         const img = new Image();

         img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const mimeType = format === "png" ? "image/png" : "image/jpeg";
            const newDataUrl = canvas.toDataURL(mimeType, quality);

            const link = document.createElement("a");
            link.href = newDataUrl;

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const extension = format === "png" ? ".png" : ".jpg";
            const finalFilename = filename || `ar_photo_${timestamp}${extension}`;

            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(`💾 Foto guardada: ${finalFilename}`);
         };

         img.src = photoDataUrl;
         return true;
      } catch (err) {
         console.error("Error guardando foto:", err);
         setError("Error al guardar la foto");
         return false;
      }
   }, []);

   const captureAndSave3D = useCallback(
      (sceneRef, rendererRef, cameraRef, showObjects = true, format = "jpeg", filename) => {
         const photo = capturePhotoWith3D(sceneRef, rendererRef, cameraRef, showObjects);
         if (photo) {
            const saved = savePhoto(photo, format, 0.9, filename);
            return { photo, saved };
         }
         return { photo: null, saved: false };
      },
      [capturePhotoWith3D, savePhoto]
   );

   const switchCamera = useCallback(async () => {
      stopCamera();
      const newFacingMode = currentFacingMode === "user" ? "environment" : "user";
      await startCamera(newFacingMode);
   }, [currentFacingMode, stopCamera, startCamera]);

   useEffect(() => {
      return () => {
         stopCamera();
      };
   }, [stopCamera]);

   return {
      isActive,
      error,
      hasPermission,
      currentFacingMode,

      videoRef,
      captureCanvasRef,

      startCamera,
      stopCamera,
      switchCamera,

      captureBasicPhoto,

      capturePhotoWith3D,
      captureAndSave3D,
      savePhoto,
   };
}

export default useCameraThree;
