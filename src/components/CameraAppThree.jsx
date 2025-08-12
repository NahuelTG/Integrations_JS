// CameraApp.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import useThreeScene from "../hooks/useThreeScene.js";
import useCameraThree from "../hooks/useCameraThree.js";
import useCube from "../hooks/useCube.js";

function CameraAppThree() {
   const { isActive, videoRef, captureCanvasRef, startCamera, stopCamera, switchCamera, captureBasicPhoto, capturePhotoWith3D, savePhoto } =
      useCameraThree();

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

   const handleBasicCapture = () => {
      const photo = captureBasicPhoto();
      if (photo) {
         setCapturedPhoto(photo);
      }
   };

   const handleCaptureWith3D = () => {
      const photo = capturePhotoWith3D(sceneRef, rendererRef, cameraRef, showCube);
      if (photo) {
         setCapturedPhoto(photo);
      }
   };

   const handleQuickSave3D = () => {
      const photo = capturePhotoWith3D(sceneRef, rendererRef, cameraRef, showCube);
      if (photo) {
         const saved = savePhoto(photo, "jpeg", 0.9);
         if (saved) {
            alert("¡Foto AR capturada y guardada!");
         }
      }
   };

   const handleSavePhoto = (format = "jpeg") => {
      if (capturedPhoto) {
         const saved = savePhoto(capturedPhoto, format, 0.9);
         if (saved) {
            alert(`¡Foto guardada como ${format.toUpperCase()}!`);
            setCapturedPhoto(null);
         }
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

         {/* Canvas de Three.js */}
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
               display: sceneReady ? "block" : "none",
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
            {/* 🎯 Captura rápida AR */}
            <button
               onClick={handleQuickSave3D}
               disabled={!sceneReady}
               style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: sceneReady ? "rgba(255, 255, 255, 0.2)" : "rgba(100, 100, 100, 0.3)",
                  border: `2px solid ${sceneReady ? "white" : "#666"}`,
                  cursor: sceneReady ? "pointer" : "not-allowed",
                  fontSize: "20px",
                  color: sceneReady ? "white" : "#666",
               }}
            >
               💾
            </button>

            {/* 🎯 Captura con cubo 3D */}
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

            {/* Captura básica (sin 3D) */}
            <button
               onClick={handleBasicCapture}
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
                     onClick={() => handleSavePhoto("jpeg")}
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
                     onClick={() => handleSavePhoto("png")}
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
