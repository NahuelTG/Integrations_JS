// CameraApp.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import * as THREE from "three";

import useThreeScene from "../hooks/useThreeScene.js";
import useCamera from "../hooks/useCamera.js";
import useCube from "../hooks/useCube.js";

function CameraAppThree() {
   const {
      isActive,
      videoRef,
      canvasRef: captureCanvasRef,
      startCamera,
      stopCamera,
      capturePhoto,
      switchCamera,
      savePhoto,
      captureAndSave,
      savePhotoAs,
   } = useCamera();

   const { threeCanvasRef, sceneRef, rendererRef, cameraRef, sceneReady, cleanup } = useThreeScene();

   const { showCube, toggleCube } = useCube(sceneRef, rendererRef, cameraRef, sceneReady);

   const [capturedPhoto, setCapturedPhoto] = useState(null);
   const navigate = useNavigate();

   useEffect(() => {
      startCamera();
      return () => {
         cleanup();
      };
   }, [startCamera, cleanup]);

   const handleBackHome = () => {
      stopCamera();
      navigate("/");
   };

   const handleCapture = () => {
      const photo = capturePhoto();
      if (photo) {
         setCapturedPhoto(photo);
      }
   };

   const handleSavePhoto = () => {
      if (capturedPhoto) {
         const saved = savePhoto(capturedPhoto);
         if (saved) {
            alert("¡Foto guardada exitosamente!");
            setCapturedPhoto(null);
         }
      }
   };

   const handleQuickSave = () => {
      const result = captureAndSave();
      if (result.saved) {
         alert("¡Foto capturada y guardada!");
      }
   };

   const capturePhotoWith3D = () => {
      if (!videoRef.current || !captureCanvasRef.current || !rendererRef.current) {
         console.log("Referencias no disponibles para captura 3D");
         return null;
      }

      const video = videoRef.current;
      const canvas = captureCanvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0);

      if (showCube && rendererRef.current && sceneRef.current && cameraRef.current) {
         try {
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
         } catch (error) {
            console.error("Error en captura 3D:", error);
         }
      }

      return canvas.toDataURL("image/jpeg", 0.9);
   };

   const handleCaptureWith3D = () => {
      const photo = capturePhotoWith3D();
      if (photo) {
         setCapturedPhoto(photo);
      }
   };

   return (
      <div
         style={{
            position: "relative",
            width: "100vw",
            height: "100dvh",
            margin: 0,
            padding: 0,
            overflow: "hidden",
            backgroundColor: "#000",
         }}
      >
         {/* Controles superiores */}
         <div
            style={{
               position: "absolute",
               top: "20px",
               left: "20px",
               right: "20px",
               zIndex: 10,
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
            }}
         >
            <button
               onClick={handleBackHome}
               style={{
                  padding: "12px 20px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "16px",
                  cursor: "pointer",
               }}
            >
               ← Atrás
            </button>

            <button
               onClick={toggleCube}
               disabled={!sceneReady}
               style={{
                  padding: "12px 20px",
                  backgroundColor: sceneReady ? "rgba(0, 0, 0, 0.7)" : "rgba(100, 100, 100, 0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "16px",
                  cursor: sceneReady ? "pointer" : "not-allowed",
               }}
            >
               {showCube ? "🚫" : "📦"} {showCube ? "Ocultar" : "Mostrar"}
            </button>

            <button
               onClick={switchCamera}
               style={{
                  padding: "12px 20px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "16px",
                  cursor: "pointer",
               }}
            >
               🔄 Cambiar
            </button>
         </div>

         {/* Indicador de estado de carga */}
         {!sceneReady && (
            <div
               style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  fontSize: "18px",
                  zIndex: 15,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  padding: "20px",
                  borderRadius: "10px",
               }}
            >
               Cargando AR... 📦
            </div>
         )}

         {/* Video de la cámara */}
         <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               objectFit: "cover",
               display: isActive ? "block" : "none",
               zIndex: 1,
            }}
         />

         {/* Canvas de Three.js - SEPARADO y SIEMPRE VISIBLE cuando sceneReady */}
         <canvas
            ref={threeCanvasRef}
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               pointerEvents: "none",
               zIndex: 10,
               display: sceneReady ? "block" : "none", // Mostrar siempre que esté listo
            }}
         />

         {/* Botones de captura */}
         <div
            style={{
               position: "absolute",
               bottom: "30px",
               left: "50%",
               transform: "translateX(-50%)",
               zIndex: 10,
               display: "flex",
               gap: "20px",
               alignItems: "center",
            }}
         >
            {/* Captura rápida */}
            <button
               onClick={handleQuickSave}
               style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "2px solid white",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "white",
               }}
            >
               💾
            </button>

            {/* Captura con cubo 3D */}
            <button
               onClick={handleCaptureWith3D}
               disabled={!sceneReady}
               style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: sceneReady ? "rgba(0, 255, 136, 0.3)" : "rgba(100, 100, 100, 0.3)",
                  border: `2px solid ${sceneReady ? "#00ff88" : "#666"}`,
                  cursor: sceneReady ? "pointer" : "not-allowed",
                  fontSize: "20px",
                  color: sceneReady ? "#00ff88" : "#666",
               }}
            >
               📦
            </button>

            {/* Captura normal */}
            <button
               onClick={handleCapture}
               style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  border: "4px solid rgba(255, 255, 255, 0.3)",
                  cursor: "pointer",
                  fontSize: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
               }}
            >
               📷
            </button>
         </div>

         {/* Canvas oculto para captura */}
         <canvas ref={captureCanvasRef} style={{ display: "none" }} />

         {/* Modal de foto capturada */}
         {capturedPhoto && (
            <div
               style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  zIndex: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
               }}
            >
               <h3 style={{ color: "white", marginBottom: "20px" }}>Foto Capturada</h3>

               <img
                  src={capturedPhoto}
                  alt="Foto capturada"
                  style={{
                     maxWidth: "90%",
                     maxHeight: "60%",
                     objectFit: "contain",
                     borderRadius: "10px",
                  }}
               />

               <div
                  style={{
                     marginTop: "20px",
                     display: "flex",
                     gap: "15px",
                     flexWrap: "wrap",
                     justifyContent: "center",
                  }}
               >
                  <button
                     onClick={() => setCapturedPhoto(null)}
                     style={{
                        padding: "12px 24px",
                        backgroundColor: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        fontSize: "16px",
                        cursor: "pointer",
                     }}
                  >
                     ✕ Descartar
                  </button>

                  <button
                     onClick={handleSavePhoto}
                     style={{
                        padding: "12px 24px",
                        backgroundColor: "#44ff44",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        fontSize: "16px",
                        cursor: "pointer",
                     }}
                  >
                     💾 Guardar JPG
                  </button>

                  <button
                     onClick={() => {
                        savePhotoAs(capturedPhoto, "png", 1.0);
                        setCapturedPhoto(null);
                     }}
                     style={{
                        padding: "12px 24px",
                        backgroundColor: "#4444ff",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        fontSize: "16px",
                        cursor: "pointer",
                     }}
                  >
                     🖼️ Guardar PNG
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}

export default CameraAppThree;
