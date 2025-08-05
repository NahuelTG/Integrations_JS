// CameraApp.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useCamera from "../hooks/useCamera.js";

function CameraApp() {
   const { isActive, videoRef, canvasRef, startCamera, stopCamera, capturePhoto, switchCamera, savePhoto, captureAndSave, savePhotoAs } =
      useCamera();

   const [capturedPhoto, setCapturedPhoto] = useState(null);

   const navigate = useNavigate();

   useEffect(() => {
      startCamera();
   }, [startCamera]);

   const handleBackHome = () => {
      stopCamera(); // ← Arreglé esto: faltaban los paréntesis
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
            setCapturedPhoto(null); // Cerrar modal
         }
      }
   };

   const handleQuickSave = () => {
      const result = captureAndSave();
      if (result.saved) {
         alert("¡Foto capturada y guardada!");
      }
   };

   return (
      <div
         style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
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

         {/* Video de la cámara - PANTALLA COMPLETA */}
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
               objectFit: "cover", // ← CLAVE: Mantiene proporción y llena la pantalla
               display: isActive ? "block" : "none",
               zIndex: 1,
            }}
         />

         {/* Botones de captura - Parte inferior */}
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
            {/* Botón captura rápida (captura y guarda directo) */}
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

            {/* Botón captura normal */}
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
         <canvas ref={canvasRef} style={{ display: "none" }} />

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

               <div style={{ marginTop: "20px", display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
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

export default CameraApp;
