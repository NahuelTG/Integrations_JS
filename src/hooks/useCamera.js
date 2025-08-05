// useCamera.js
import { useState, useRef, useEffect, useCallback } from "react";

function useCamera() {
   // 1. Estados para manejar la cámara
   const [isActive, setIsActive] = useState(false);
   const [error, setError] = useState(null);
   const [hasPermission, setHasPermission] = useState(null);
   const [currentFacingMode, setCurrentFacingMode] = useState("environment");

   // 2. Referencias para elementos del DOM
   const videoRef = useRef(null);
   const canvasRef = useRef(null);
   const streamRef = useRef(null);

   // 3. Función para iniciar la cámara
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

            // Conectamos el stream al elemento video
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

   // 4. Función para detener la cámara
   const stopCamera = useCallback(() => {
      if (streamRef.current) {
         streamRef.current.getTracks().forEach((track) => {
            track.stop();
         });
      }

      setIsActive(false);
   }, []);

   // 5. Función para capturar una foto
   const capturePhoto = useCallback(() => {
      if (!videoRef.current || !canvasRef.current || !isActive) {
         setError("Cámara no disponible para capturar");
         return null;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Configuramos el canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujamos el frame actual del video en el canvas
      context.drawImage(video, 0, 0);

      // Convertimos el canvas a una imagen base64
      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      return photoDataUrl;
   }, [isActive]);

   const savePhoto = useCallback((photoDataUrl, filename) => {
      if (!photoDataUrl) {
         setError("No hay foto para guardar");
         return false;
      }

      try {
         // Crear elemento <a> temporal para descarga
         const link = document.createElement("a");
         link.href = photoDataUrl;

         // Generar nombre del archivo
         const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
         const finalFilename = filename || `foto_${timestamp}.jpg`;

         link.download = finalFilename;

         // Simular click para descargar
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);

         return true;
      } catch (err) {
         console.error("Error guardando foto:", err);
         setError("Error al guardar la foto");
         return false;
      }
   }, []);

   const captureAndSave = useCallback(
      (filename) => {
         const photo = capturePhoto();
         if (photo) {
            const saved = savePhoto(photo, filename);
            return { photo, saved };
         }
         return { photo: null, saved: false };
      },
      [capturePhoto, savePhoto]
   );

   // 8. Función para guardar en diferentes formatos - NUEVA
   const savePhotoAs = useCallback((photoDataUrl, format = "jpeg", quality = 0.9, filename) => {
      if (!photoDataUrl) {
         setError("No hay foto para guardar");
         return false;
      }

      try {
         // Si ya es base64, convertir a blob y luego a nuevo formato
         const canvas = document.createElement("canvas");
         const ctx = canvas.getContext("2d");
         const img = new Image();

         img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Convertir a formato deseado
            const mimeType = format === "png" ? "image/png" : "image/jpeg";
            const newDataUrl = canvas.toDataURL(mimeType, quality);

            // Descargar
            const link = document.createElement("a");
            link.href = newDataUrl;

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const extension = format === "png" ? ".png" : ".jpg";
            const finalFilename = filename || `foto_${timestamp}${extension}`;

            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
         };

         img.src = photoDataUrl;
         return true;
      } catch (err) {
         console.error("Error guardando foto:", err);
         setError("Error al guardar la foto");
         return false;
      }
   }, []);

   const switchCamera = useCallback(async () => {
      stopCamera();
      const newFacingMode = currentFacingMode === "user" ? "environment" : "user";
      await startCamera(newFacingMode);
   }, [currentFacingMode, stopCamera, startCamera]);

   // 6. Cleanup automático cuando el componente se desmonta
   useEffect(() => {
      return () => {
         stopCamera(); // Limpiamos recursos al desmontar
      };
   }, [stopCamera]);

   return {
      // Estados
      isActive,
      error,
      hasPermission,

      // Referencias para JSX
      videoRef,
      canvasRef,

      // Funciones de control
      switchCamera,
      startCamera,
      capturePhoto,
      stopCamera,

      savePhoto,
      captureAndSave,
      savePhotoAs,
   };
}

export default useCamera;
