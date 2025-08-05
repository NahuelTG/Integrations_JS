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
   const capturePhoto = () => {
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
      const photoDataUrl = canvas.toDataURL("image/png");
      return photoDataUrl;
   };

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
      stopCamera,
      capturePhoto,
   };
}

export default useCamera;
